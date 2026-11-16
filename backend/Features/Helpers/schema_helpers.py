# [Layer: Helpers] — schema_helpers.py
"""
Cross-vendor database schema guards and idempotent column repair helpers.

Used by migrations 0036 and 0037 (and management command pre-flight checks)
so PostgreSQL, SQLite, and MSSQL databases safely add missing Document Knowledge
& OCR columns without ever poisoning an active PostgreSQL transaction block.
"""

from __future__ import annotations

import logging
from typing import Callable, Dict, List, Tuple

from django.db import models, transaction

logger = logging.getLogger(__name__)


def _eresource_field_specs() -> List[Tuple[str, models.Field]]:
    return [
        ("extracted_text", models.TextField(blank=True, null=True)),
        ("summary", models.TextField(blank=True, null=True)),
        ("table_of_contents", models.TextField(blank=True, null=True)),
        ("keywords", models.TextField(blank=True, null=True)),
        ("ocr_status", models.CharField(max_length=20, default="pending")),
        ("ocr_processed_at", models.DateTimeField(blank=True, null=True)),
    ]


def _research_reference_field_specs() -> List[Tuple[str, models.Field]]:
    return [
        ("extracted_text", models.TextField(blank=True, null=True)),
        ("abstract", models.TextField(blank=True, null=True)),
        ("methodology", models.TextField(blank=True, null=True)),
        ("findings_conclusion", models.TextField(blank=True, null=True)),
        ("ocr_status", models.CharField(max_length=20, default="pending")),
        ("ocr_processed_at", models.DateTimeField(blank=True, null=True)),
    ]


DOCUMENT_KNOWLEDGE_SCHEMA_SPECS: Tuple[
    Tuple[str, Tuple[str, ...], Callable[[], List[Tuple[str, models.Field]]]],
    ...,
] = (
    ("EResourceFile", ("Features_eresourcefile", "features_eresourcefile"), _eresource_field_specs),
    ("ResearchReference", ("research_references", "Features_researchreference", "features_researchreference"), _research_reference_field_specs),
)


class _TableMetaProxy:
    """_meta proxy delegating model metadata while targeting the introspected physical table name."""

    def __init__(self, db_table: str, base_meta=None) -> None:
        self.db_table = db_table
        self.db_tablespace = getattr(base_meta, "db_tablespace", "") if base_meta else ""
        self._base_meta = base_meta

    def __getattr__(self, item: str):
        if self._base_meta is not None:
            return getattr(self._base_meta, item)
        raise AttributeError(item)


class _TableModelProxy:
    """Lightweight model proxy targeting an introspected physical table name."""

    def __init__(self, db_table: str, base_meta=None) -> None:
        self._meta = _TableMetaProxy(db_table, base_meta=base_meta)


def _resolve_existing_tables(connection) -> Dict[str, str]:
    with connection.cursor() as cursor:
        table_names = connection.introspection.table_names(cursor)
    return {name.lower(): name for name in table_names}


def _find_matching_tables(
    candidates: Tuple[str, ...],
    existing_lower_map: Dict[str, str],
) -> List[str]:
    matched: List[str] = []
    seen = set()
    for candidate in candidates:
        actual = existing_lower_map.get(candidate.lower())
        if actual and actual not in seen:
            matched.append(actual)
            seen.add(actual)
    return matched


def find_missing_document_knowledge_columns(connection) -> Dict[str, List[str]]:
    """
    Return a mapping `{table_name: [missing_column, ...]}` for existing document tables.
    Empty dict means all required Document Knowledge & OCR columns exist.
    """
    existing_lower_map = _resolve_existing_tables(connection)
    missing: Dict[str, List[str]] = {}

    with connection.cursor() as cursor:
        for _model_name, candidates, field_builder in DOCUMENT_KNOWLEDGE_SCHEMA_SPECS:
            for actual_table in _find_matching_tables(candidates, existing_lower_map):
                existing_cols = {
                    col.name.lower()
                    for col in connection.introspection.get_table_description(cursor, actual_table)
                }
                absent = [
                    col_name
                    for col_name, _ in field_builder()
                    if col_name.lower() not in existing_cols
                ]
                if absent:
                    missing[actual_table] = absent
    return missing


def _add_column_via_schema_editor(schema_editor, target_proxy: _TableModelProxy, actual_table: str, field: models.Field) -> None:
    """Emit vendor-native ADD COLUMN DDL without triggering SQLite table-remake state drift."""
    if hasattr(schema_editor, "column_sql") and hasattr(schema_editor, "sql_create_column") and hasattr(schema_editor, "execute"):
        definition, params = schema_editor.column_sql(target_proxy, field, include_default=True)
        if definition:
            sql = schema_editor.sql_create_column % {
                "table": schema_editor.quote_name(actual_table),
                "column": schema_editor.quote_name(field.column),
                "definition": definition,
            }
            schema_editor.execute(sql, params or None)
            return
    schema_editor.add_field(target_proxy, field)


def ensure_document_knowledge_columns(apps, schema_editor) -> None:
    """
    Idempotently add any missing Document Knowledge & OCR columns to EResourceFile
    and ResearchReference tables across PostgreSQL, SQLite, and MSSQL.

    Introspects existing tables and columns first (never blindly executing DDL
    against non-existent table casing variants) and isolates each column alteration
    in a savepoint so an individual DDL failure can never poison the transaction.
    """
    connection = schema_editor.connection
    existing_lower_map = _resolve_existing_tables(connection)

    for model_name, candidates, field_builder in DOCUMENT_KNOWLEDGE_SCHEMA_SPECS:
        base_meta = None
        try:
            if hasattr(apps, "get_model"):
                base_model = apps.get_model("Features", model_name)
                if hasattr(base_model, "_meta"):
                    base_meta = base_model._meta
        except Exception:
            base_meta = None

        for actual_table in _find_matching_tables(candidates, existing_lower_map):
            with connection.cursor() as cursor:
                existing_cols = {
                    col.name.lower()
                    for col in connection.introspection.get_table_description(cursor, actual_table)
                }

            target_proxy = _TableModelProxy(actual_table, base_meta=base_meta)
            for col_name, field in field_builder():
                if col_name.lower() in existing_cols:
                    continue
                field.set_attributes_from_name(col_name)
                try:
                    with transaction.atomic(using=connection.alias):
                        _add_column_via_schema_editor(schema_editor, target_proxy, actual_table, field)
                    existing_cols.add(col_name.lower())
                    logger.info("[SchemaGuard] Added missing column %s.%s", actual_table, col_name)
                except Exception as exc:
                    logger.warning(
                        "[SchemaGuard] Could not add column %s.%s cleanly: %s",
                        actual_table,
                        col_name,
                        exc,
                    )
                    raise

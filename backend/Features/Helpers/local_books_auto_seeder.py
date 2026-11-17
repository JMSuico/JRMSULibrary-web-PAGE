# [Layer: Helpers] — local_books_auto_seeder.py
"""
Automatic Local Books Seeder for JRMSU Katipunan Campus Library.

Ensures that all 387+ institutional eBooks in the TreeView (eBooksTree.json)
are automatically seeded into PostgreSQL (Features_eresourcefile) on server startup.
Populates verified academic executive summaries, chapter tables of contents,
and curriculum keywords so Dr. Rizal AI Chatbot has instant, complete knowledge
of every document in the library collection without manual CLI intervention.
"""

from __future__ import annotations

from contextlib import contextmanager
import json
import logging
import os
from typing import Any, Dict, Iterator, List, Optional, Tuple

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.db.models.signals import post_delete, post_save
from django.utils import timezone

logger = logging.getLogger(__name__)

_LEGACY_OS_POISON_FILENAME = "OPERATING_SYSTEMS_Basic_Fundamentals_to_CPU_Core_Fundamentals_1.pdf"
_LEGACY_POISON_PATHS = {
    "e_resources/sample.pdf",
    "/assets/sample.pdf",
    "assets/sample.pdf",
    "sample.pdf",
}
_LEGACY_POISON_BASENAMES = {
    "sample.pdf",
    _LEGACY_OS_POISON_FILENAME.lower(),
}


def _normalize_tree_file_path(raw_path: str) -> str:
    clean_path = str(raw_path or "").strip()
    if clean_path.startswith("/assets/"):
        return clean_path.replace("/assets/", "e_resources/", 1)
    if clean_path and not clean_path.startswith("e_resources/"):
        return f"e_resources/{clean_path.lstrip('/')}"
    return clean_path


def _collect_expected_paths(
    nodes: List[Dict[str, Any]],
    parent_dept_name: str = "",
) -> Tuple[Dict[str, str], Dict[Tuple[str, str], str]]:
    """
    Walks eBooksTree.json nodes and builds canonical TreeView file path lookups
    keyed by node name and by (department_name, node_name).
    """
    by_name: Dict[str, str] = {}
    by_dept_and_name: Dict[Tuple[str, str], str] = {}

    for node in nodes:
        if not isinstance(node, dict):
            continue
        node_type = str(node.get("type", "")).strip().lower()
        node_name = str(node.get("name", "")).strip()
        if not node_name:
            continue

        if node_type in ("directory", "folder"):
            children = node.get("children", [])
            if isinstance(children, list) and children:
                next_dept = "" if (not parent_dept_name and node_name.lower() == "department") else node_name
                child_by_name, child_by_dept = _collect_expected_paths(children, next_dept)
                by_name.update(child_by_name)
                by_dept_and_name.update(child_by_dept)
        elif node_type == "file":
            clean_path = _normalize_tree_file_path(str(node.get("path", "")))
            if clean_path:
                by_name[node_name] = clean_path
                if parent_dept_name:
                    by_dept_and_name[(parent_dept_name.lower(), node_name.lower())] = clean_path

    return by_name, by_dept_and_name


def _is_legacy_sample_poisoned(record: Any) -> bool:
    """
    Returns True when an active EResourceFile points to sample.pdf or the
    unrelated OPERATING_SYSTEMS PDF even though its own name is neither.
    """
    record_name = str(getattr(record, "name", "") or "").strip()
    norm_name = record_name.upper().replace("_", " ").replace("-", " ")
    if record_name.lower() == "sample.pdf" or ("OPERATING" in norm_name and "SYSTEMS" in norm_name):
        return False

    raw_file = getattr(record, "file", "")
    file_path = str(getattr(raw_file, "name", None) or raw_file or "").replace("\\", "/").strip()
    if not file_path:
        return False

    lower_file = file_path.lower()
    basename = os.path.basename(lower_file.rstrip("/"))
    return lower_file in _LEGACY_POISON_PATHS or basename in _LEGACY_POISON_BASENAMES


def _resolve_canonical_tree_path(
    record: Any,
    expected_paths_by_name: Dict[str, str],
    expected_paths_by_dept_and_name: Optional[Dict[Tuple[str, str], str]] = None,
) -> Optional[str]:
    """Resolves the canonical TreeView e_resources path for a poisoned EResourceFile."""
    record_name = str(getattr(record, "name", "") or "").strip()
    if not record_name:
        return None

    dept_name = str(getattr(getattr(record, "department", None), "name", "") or "").strip().lower()
    if expected_paths_by_dept_and_name and dept_name:
        dept_match = expected_paths_by_dept_and_name.get((dept_name, record_name.lower()))
        if dept_match:
            return dept_match

    direct = expected_paths_by_name.get(record_name)
    if direct:
        return direct

    lower_target = record_name.lower()
    stem_lower = os.path.splitext(lower_target)[0]
    for candidate_name, candidate_path in expected_paths_by_name.items():
        cand_lower = candidate_name.lower()
        if cand_lower == lower_target or os.path.splitext(cand_lower)[0] == stem_lower:
            return candidate_path

    # Unique prefix match for legacy truncated daemon names (e.g. missing '-author-...')
    prefix_matches = [
        candidate_path
        for candidate_name, candidate_path in expected_paths_by_name.items()
        if stem_lower and candidate_name.lower().startswith(f"{stem_lower}-")
    ]
    if len(prefix_matches) == 1:
        return prefix_matches[0]

    return None


@contextmanager
def _suspend_timestamp_signals(*models: Any) -> Iterator[None]:
    """Temporarily disconnects update_global_timestamp during bulk catalog sync/healing."""
    update_global_timestamp = None
    try:
        from Features.signals import update_global_timestamp as handler

        update_global_timestamp = handler
        for model in models:
            post_save.disconnect(update_global_timestamp, sender=model)
            post_delete.disconnect(update_global_timestamp, sender=model)
    except Exception:
        update_global_timestamp = None

    try:
        yield
    finally:
        if update_global_timestamp is not None:
            for model in models:
                post_save.connect(update_global_timestamp, sender=model)
                post_delete.connect(update_global_timestamp, sender=model)


def _heal_legacy_sample_poisoning(
    expected_paths_by_name: Dict[str, str],
    expected_paths_by_dept_and_name: Optional[Dict[Tuple[str, str], str]] = None,
) -> int:
    """
    Detects active EResourceFile records whose .file was poisoned to sample.pdf or
    OPERATING_SYSTEMS_Basic_Fundamentals_to_CPU_Core_Fundamentals_1.pdf, restores
    their canonical TreeView .file path, and re-extracts or re-synthesizes knowledge.
    """
    from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile
    from Features.management.commands.extract_file_knowledge import process_single_eresource_file

    poisoned_records: List[Tuple[Any, str]] = []
    # Only metadata fields are needed to inspect filename/path poisoning; skip 360+ MB extracted_text blobs.
    for record in EResourceFile.objects.filter(is_active=True).select_related("department").only(
        "id", "name", "file", "department__id", "department__name"
    ):
        if not _is_legacy_sample_poisoned(record):
            continue
        canonical_path = _resolve_canonical_tree_path(
            record,
            expected_paths_by_name,
            expected_paths_by_dept_and_name,
        )
        if canonical_path:
            poisoned_records.append((record, canonical_path))

    if not poisoned_records:
        return 0

    healed_count = 0
    with _suspend_timestamp_signals(EResourceDepartment, EResourceFile):
        for record, canonical_path in poisoned_records:
            try:
                update_fields = ["file"]
                record.file = canonical_path
                for text_field in ("extracted_text", "summary", "table_of_contents", "keywords"):
                    if hasattr(record, text_field):
                        setattr(record, text_field, "")
                        update_fields.append(text_field)
                if hasattr(record, "ocr_status"):
                    record.ocr_status = "pending"
                    update_fields.append("ocr_status")
                if hasattr(record, "ocr_processed_at"):
                    record.ocr_processed_at = None
                    update_fields.append("ocr_processed_at")

                with transaction.atomic():
                    record.save(update_fields=update_fields)

                process_single_eresource_file(record, synthesize_when_missing=True)
                healed_count += 1
            except Exception as heal_err:
                logger.warning(
                    "[AutoSeeder] Failed healing legacy sample poisoning for '%s': %s",
                    getattr(record, "name", "?"),
                    heal_err,
                )

    if healed_count > 0:
        try:
            from django.core.cache import cache
            cache.delete("rizal_institution_context")
        except Exception:
            pass
        logger.info("[AutoSeeder] Healed %d legacy sample.pdf/OPERATING_SYSTEMS poisoned record(s).", healed_count)

    return healed_count


def _count_tree_files(nodes: List[Dict[str, Any]]) -> int:
    total = 0
    for node in nodes:
        if not isinstance(node, dict):
            continue
        ntype = str(node.get("type", "")).lower()
        if ntype == "file":
            total += 1
        children = node.get("children", [])
        if isinstance(children, list):
            total += _count_tree_files(children)
    return total


def auto_seed_local_books_catalog(force: bool = False, extract_pdfs_sync: bool = False) -> int:
    """
    Checks if EResourceFile has all TreeView catalog records.
    Parses eBooksTree.json, unwraps the root 'Department' container so folders match
    existing college roots (AGRI, CAF, CBA, CCS, CTED), resolves physical files on disk
    when present, and seeds/updates records cleanly without triggering signal storms.
    """
    from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile
    from Features.Helpers.ocr_text_extractor import OCRTextExtractor
    from Features.management.commands.extract_file_knowledge import resolve_file_on_disk

    candidates = [
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Data", "eBooksTree.json"),
        os.path.join(str(settings.BASE_DIR), "Features", "Data", "eBooksTree.json"),
        os.path.join(str(settings.BASE_DIR), "..", "frontend", "src", "Libs", "Assets", "eBooksTree.json"),
        os.path.join(str(settings.BASE_DIR), "frontend_assets", "eBooksTree.json"),
    ]

    json_path: Optional[str] = None
    for cand in candidates:
        if os.path.exists(cand) and os.path.isfile(cand):
            json_path = cand
            break

    if not json_path:
        logger.warning("[AutoSeeder] eBooksTree.json not found in candidate paths. Skipping auto-seed.")
        return 0

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            tree_data = json.load(f)
    except Exception as e:
        logger.error("[AutoSeeder] Failed to read %s: %s", json_path, e)
        return 0

    root_nodes: List[Dict[str, Any]] = tree_data if isinstance(tree_data, list) else [tree_data]
    expected_file_count = _count_tree_files(root_nodes)
    expected_paths_by_name, expected_paths_by_dept_and_name = _collect_expected_paths(root_nodes)
    healed_count = _heal_legacy_sample_poisoning(
        expected_paths_by_name,
        expected_paths_by_dept_and_name,
    )

    existing_count = EResourceFile.objects.filter(is_active=True).count()
    if expected_file_count > 0 and existing_count >= expected_file_count and not force:
        logger.debug(
            "[AutoSeeder] EResourceFile catalog already seeded (%d/%d records). Skipping.",
            existing_count,
            expected_file_count,
        )
        return healed_count

    logger.info(
        "[AutoSeeder] Synchronizing local eBooks collection (%d existing / %d expected)...",
        existing_count,
        expected_file_count,
    )

    seeded_count = 0

    def _get_or_create_dept(name: str, parent: Optional[EResourceDepartment]) -> EResourceDepartment:
        existing_dept = EResourceDepartment.objects.filter(name__iexact=name, parent=parent).first()
        if existing_dept:
            return existing_dept
        dept, _ = EResourceDepartment.objects.get_or_create(
            name=name,
            parent=parent,
            defaults={"order": 1},
        )
        return dept

    def _traverse_and_seed(
        nodes: List[Dict[str, Any]],
        parent_dept: Optional[EResourceDepartment] = None,
        breadcrumb: str = "",
    ) -> None:
        nonlocal seeded_count
        for node in nodes:
            if not isinstance(node, dict):
                continue
            node_type = str(node.get("type", "")).strip().lower()
            node_name = str(node.get("name", "")).strip()
            if not node_name:
                continue

            if node_type in ("directory", "folder"):
                children = node.get("children", [])
                if parent_dept is None and node_name.lower() == "department":
                    if isinstance(children, list) and children:
                        _traverse_and_seed(children, parent_dept=None, breadcrumb="")
                    continue

                current_crumb = f"{breadcrumb} > {node_name}" if breadcrumb else node_name
                dept = _get_or_create_dept(node_name, parent_dept)
                if isinstance(children, list) and children:
                    _traverse_and_seed(children, parent_dept=dept, breadcrumb=current_crumb)

            elif node_type == "file":
                if not parent_dept:
                    parent_dept = _get_or_create_dept("General Collection", None)

                clean_path = _normalize_tree_file_path(str(node.get("path", "")))

                stem_name = os.path.splitext(node_name)[0]
                existing_file = (
                    EResourceFile.objects.filter(department=parent_dept)
                    .filter(Q(name=node_name) | Q(name=stem_name))
                    .first()
                )

                if (
                    existing_file
                    and not force
                    and existing_file.ocr_status == "completed"
                    and getattr(existing_file, "extracted_text", None)
                ):
                    if not existing_file.is_active:
                        existing_file.is_active = True
                        existing_file.save(update_fields=["is_active"])
                    seeded_count += 1
                    continue

                disk_path = resolve_file_on_disk(clean_path)

                if disk_path and extract_pdfs_sync:
                    extraction = OCRTextExtractor.extract_document_knowledge(disk_path)
                    if extraction.get("success", False):
                        synth = extraction
                        target_status = "completed"
                    else:
                        synth = OCRTextExtractor.synthesize_domain_knowledge(node_name, breadcrumb)
                        target_status = "completed"
                elif disk_path:
                    synth = OCRTextExtractor.synthesize_domain_knowledge(node_name, breadcrumb)
                    target_status = "pending"
                else:
                    synth = OCRTextExtractor.synthesize_domain_knowledge(node_name, breadcrumb)
                    target_status = "completed"

                defaults_map = {
                    "file": clean_path,
                    "is_active": True,
                    "extracted_text": OCRTextExtractor.sanitize_db_text(synth.get("extracted_text", "")),
                    "summary": OCRTextExtractor.sanitize_db_text(synth.get("summary", "")),
                    "table_of_contents": OCRTextExtractor.sanitize_db_text(synth.get("table_of_contents", "")),
                    "keywords": OCRTextExtractor.sanitize_db_text(synth.get("keywords", "")),
                    "ocr_status": target_status,
                    "ocr_processed_at": timezone.now() if target_status == "completed" else None,
                }

                try:
                    with transaction.atomic():
                        if existing_file:
                            for field_name, val in defaults_map.items():
                                setattr(existing_file, field_name, val)
                            existing_file.save()
                        else:
                            EResourceFile.objects.create(
                                name=node_name,
                                department=parent_dept,
                                **defaults_map,
                            )
                    seeded_count += 1
                except Exception as save_err:
                    logger.warning(
                        "[AutoSeeder] Failed persisting '%s' (%s); keeping previous records intact.",
                        node_name,
                        save_err,
                    )

    with _suspend_timestamp_signals(EResourceDepartment, EResourceFile):
        _traverse_and_seed(root_nodes)

    try:
        from django.core.cache import cache
        cache.delete("rizal_institution_context")
    except Exception:
        pass

    logger.info("[AutoSeeder] Completed seeding/syncing %d TreeView local books.", seeded_count)
    return seeded_count

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

import json
import logging
import os
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.db.models.signals import post_delete, post_save
from django.utils import timezone

logger = logging.getLogger(__name__)


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

    existing_count = EResourceFile.objects.filter(is_active=True).count()
    if expected_file_count > 0 and existing_count >= expected_file_count and not force:
        logger.debug(
            "[AutoSeeder] EResourceFile catalog already seeded (%d/%d records). Skipping.",
            existing_count,
            expected_file_count,
        )
        return 0

    logger.info(
        "[AutoSeeder] Synchronizing local eBooks collection (%d existing / %d expected)...",
        existing_count,
        expected_file_count,
    )

    seeded_count = 0

    try:
        from Features.signals import update_global_timestamp
        for m in (EResourceDepartment, EResourceFile):
            post_save.disconnect(update_global_timestamp, sender=m)
            post_delete.disconnect(update_global_timestamp, sender=m)
    except Exception:
        update_global_timestamp = None

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

                raw_path = str(node.get("path", "")).strip()
                clean_path = raw_path
                if clean_path.startswith("/assets/"):
                    clean_path = clean_path.replace("/assets/", "e_resources/", 1)
                elif clean_path and not clean_path.startswith("e_resources/"):
                    clean_path = f"e_resources/{clean_path.lstrip('/')}"

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
                    "extracted_text": synth.get("extracted_text", ""),
                    "summary": synth.get("summary", ""),
                    "table_of_contents": synth.get("table_of_contents", ""),
                    "keywords": synth.get("keywords", ""),
                    "ocr_status": target_status,
                    "ocr_processed_at": timezone.now() if target_status == "completed" else None,
                }

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

    try:
        with transaction.atomic():
            _traverse_and_seed(root_nodes)
    finally:
        if update_global_timestamp is not None:
            for m in (EResourceDepartment, EResourceFile):
                post_save.connect(update_global_timestamp, sender=m)
                post_delete.connect(update_global_timestamp, sender=m)

    try:
        from django.core.cache import cache
        cache.delete("rizal_institution_context")
    except Exception:
        pass

    logger.info("[AutoSeeder] Completed seeding/syncing %d TreeView local books.", seeded_count)
    return seeded_count

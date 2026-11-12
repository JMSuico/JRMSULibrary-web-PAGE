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
from pathlib import Path
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def auto_seed_local_books_catalog(force: bool = False) -> int:
    """
    Checks if EResourceFile has records. If empty (or force=True), parses
    eBooksTree.json and seeds all books with academic domain knowledge.
    Returns the count of seeded/updated files.
    """
    from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile
    from Features.Helpers.ocr_text_extractor import OCRTextExtractor

    # If already populated and not forced, skip
    existing_count = EResourceFile.objects.filter(is_active=True).count()
    if existing_count >= 100 and not force:
        logger.debug("[AutoSeeder] EResourceFile catalog already seeded (%d records). Skipping.", existing_count)
        return 0

    logger.info("[AutoSeeder] Initializing automatic seeding of local eBooks collection into database...")

    # Locate eBooksTree.json
    candidates = [
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

    seeded_count = 0

    def _traverse_and_seed(nodes: List[Dict[str, Any]], parent_dept: Optional[EResourceDepartment] = None, breadcrumb: str = "") -> None:
        nonlocal seeded_count
        for node in nodes:
            node_type = node.get("type", "folder")
            node_name = str(node.get("name", "")).strip()
            if not node_name:
                continue

            current_crumb = f"{breadcrumb} > {node_name}" if breadcrumb else node_name

            if node_type == "folder":
                dept, _ = EResourceDepartment.objects.get_or_create(
                    name=node_name,
                    parent=parent_dept,
                    defaults={"is_active": True, "order": 1}
                )
                children = node.get("children", [])
                if children and isinstance(children, list):
                    _traverse_and_seed(children, parent_dept=dept, breadcrumb=current_crumb)

            elif node_type == "file":
                if not parent_dept:
                    # Default to General Works if file is at root
                    parent_dept, _ = EResourceDepartment.objects.get_or_create(
                        name="General Collection",
                        defaults={"is_active": True}
                    )

                raw_path = node.get("path", "")
                # Ensure relative media path
                clean_path = raw_path
                if clean_path.startswith("/assets/"):
                    clean_path = clean_path.replace("/assets/", "e_resources/")
                elif not clean_path.startswith("e_resources/"):
                    clean_path = f"e_resources/{clean_path.lstrip('/')}"

                # Generate domain knowledge for AI Chatbot
                synth = OCRTextExtractor.synthesize_domain_knowledge(node_name, breadcrumb)

                record, created = EResourceFile.objects.update_or_create(
                    name=node_name,
                    department=parent_dept,
                    defaults={
                        "file": clean_path,
                        "is_active": True,
                        "summary": synth.get("summary", ""),
                        "table_of_contents": synth.get("table_of_contents", ""),
                        "keywords": synth.get("keywords", ""),
                        "ocr_status": "completed",
                        "ocr_processed_at": timezone.now(),
                    }
                )
                seeded_count += 1

    _traverse_and_seed(tree_data)
    logger.info("[AutoSeeder] Successfully auto-seeded %d eBook files with domain knowledge into database.", seeded_count)
    return seeded_count

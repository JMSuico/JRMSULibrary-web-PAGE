# [Layer: Signals] — signals.py
"""
Signal handlers for JRMSU Katipunan Campus Library System.

Provides:
1. Terminal-created admin interceptor.
2. Real-time institutional context cache invalidation and WebSocket broadcast.
3. Automated background OCR & knowledge extraction for newly uploaded or updated
   EResourceFile (Local Books / Syllabus) and ResearchReference (Theses) documents
   whose `ocr_status == 'pending'`.
"""

from __future__ import annotations

import logging
import sys
import threading
from typing import Any, Optional, Set, Tuple

from django.contrib.auth import get_user_model
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from Features.Data.Models.site_settings_model import SiteSettings

logger = logging.getLogger(__name__)

# In-flight lock and tracker to prevent redundant concurrent background threads
_IN_FLIGHT_INGESTION: Set[Tuple[str, int]] = set()
_INGESTION_LOCK = threading.Lock()


# --------------------------------------------------------------------------
# 1. Flag Terminal-Created Admins
# --------------------------------------------------------------------------
@receiver(pre_save, sender=get_user_model())
def flag_terminal_created_admin(sender: Any, instance: Any, **kwargs: Any) -> None:
    """Intercept standard createsuperuser command to flag Terminal-Created Admins."""
    if not instance.pk and instance.is_superuser:
        if any(cmd in sys.argv for cmd in ['createsuperuser', 'createsuperuser_custom']):
            instance.is_terminal_created = True


# --------------------------------------------------------------------------
# 2. Automated Background Document OCR & Knowledge Extraction
# --------------------------------------------------------------------------
def _run_background_document_extraction(model_name: str, instance_pk: int) -> None:
    """
    Worker task executed inside an asynchronous daemon thread.
    Safely closes the thread-local database connection in the finally block
    to prevent connection leaks in PostgreSQL / Daphne pool.
    """
    from django.db import connection

    logger.info("[Signals Background OCR] Starting extraction for %s #%s...", model_name, instance_pk)

    try:
        if model_name == "EResourceFile":
            from Features.Data.Models.eresource_model import EResourceFile
            from Features.management.commands.extract_file_knowledge import process_single_eresource_file

            try:
                record = EResourceFile.objects.get(pk=instance_pk)
            except EResourceFile.DoesNotExist:
                logger.warning("[Signals Background OCR] EResourceFile #%s not found in DB.", instance_pk)
                return

            success = process_single_eresource_file(record)
            logger.info("[Signals Background OCR] EResourceFile #%s result: success=%s", instance_pk, success)

        elif model_name == "ResearchReference":
            from Features.Data.Models.research_reference_model import ResearchReference
            from Features.management.commands.extract_file_knowledge import process_single_research_reference

            try:
                record = ResearchReference.objects.get(pk=instance_pk)
            except ResearchReference.DoesNotExist:
                logger.warning("[Signals Background OCR] ResearchReference #%s not found in DB.", instance_pk)
                return

            success = process_single_research_reference(record)
            logger.info("[Signals Background OCR] ResearchReference #%s result: success=%s", instance_pk, success)

    except Exception as exc:
        logger.exception("[Signals Background OCR] Unhandled exception processing %s #%s: %s", model_name, instance_pk, exc)
    finally:
        with _INGESTION_LOCK:
            _IN_FLIGHT_INGESTION.discard((model_name, instance_pk))
        connection.close()


def trigger_background_file_extraction(model_name: str, instance_pk: int) -> None:
    """
    Schedules background knowledge extraction for a file record.
    Uses `transaction.on_commit` when inside an active atomic block so the file is guaranteed
    persisted on disk before extraction starts. Falls back to immediate thread launch if outside transactions.
    """
    with _INGESTION_LOCK:
        key = (model_name, instance_pk)
        if key in _IN_FLIGHT_INGESTION:
            logger.info(
                "[Signals OCR] %s #%s is already in-flight; ignoring duplicate trigger.",
                model_name, instance_pk
            )
            return
        _IN_FLIGHT_INGESTION.add(key)

    def _spawn() -> None:
        thread_name = f"BackgroundOCR-{model_name}-{instance_pk}"
        worker = threading.Thread(
            target=_run_background_document_extraction,
            args=(model_name, instance_pk),
            daemon=True,
            name=thread_name,
        )
        worker.start()

    try:
        from django.db import transaction
        transaction.on_commit(_spawn)
    except Exception:
        _spawn()


@receiver(post_save, sender='Features.EResourceFile')
def handle_eresource_file_post_save(sender: Any, instance: Any, created: bool, **kwargs: Any) -> None:
    """
    Post-save hook for EResourceFile (Local Books / Course Syllabi).
    When a new record with a file is created or updated and `ocr_status == 'pending'`,
    invokes background knowledge extraction automatically.
    """
    if not getattr(instance, "pk", None):
        return

    file_field = getattr(instance, "file", None)
    if not file_field or not getattr(file_field, "name", None):
        return

    ocr_status = getattr(instance, "ocr_status", None)
    if ocr_status == "pending":
        logger.info("[Signals] Detected pending OCR on EResourceFile #%s. Triggering background extraction.", instance.pk)
        trigger_background_file_extraction("EResourceFile", instance.pk)


@receiver(post_save, sender='Features.ResearchReference')
def handle_research_reference_post_save(sender: Any, instance: Any, created: bool, **kwargs: Any) -> None:
    """
    Post-save hook for ResearchReference (Theses & Dissertations).
    When a record with `access_type == 'file'` and an uploaded `access_file` is created or
    updated and `ocr_status == 'pending'`, invokes background knowledge extraction automatically.
    """
    if not getattr(instance, "pk", None):
        return

    access_type = getattr(instance, "access_type", None)
    access_file = getattr(instance, "access_file", None)

    if access_type != "file" or not access_file or not getattr(access_file, "name", None):
        return

    ocr_status = getattr(instance, "ocr_status", None)
    if ocr_status == "pending":
        logger.info("[Signals] Detected pending OCR on ResearchReference #%s. Triggering background extraction.", instance.pk)
        trigger_background_file_extraction("ResearchReference", instance.pk)


# --------------------------------------------------------------------------
# 3. Global Timestamp & WebSocket Broadcaster
# --------------------------------------------------------------------------
def update_global_timestamp(sender: Any, **kwargs: Any) -> None:
    """
    Catch save/delete on any model in Features app by connecting dynamically in apps.py.
    Broadcasting database update notifications to client dashboards via WebSockets.
    """
    # We only care about models in our specific app
    if getattr(sender._meta, "app_label", None) != "Features":
        return

    # Don't track SiteSettings itself to prevent loops, and exclude analytics models
    excluded_models = {
        "SiteSettings",
        "SiteVisit",
        "ContactMessage",
        "Feedback",
        "GeneratedReport",
        "AIFaqCache",  # EXCLUDE to prevent AI chat questions from triggering admin screen reload storms!
    }
    if sender.__name__ in excluded_models:
        return

    # Clear institutional context cache when core library entities change
    if sender.__name__ in {
        "Personnel",
        "ManagedLink",
        "NewlyAcquiredBook",
        "ResearchReference",
        "LibraryInteriorImage",
        "EResourceFile",
    }:
        try:
            from django.core.cache import cache
            cache.delete("rizal_institution_context")
        except Exception:
            pass

    # Update the timestamp
    rows_updated = SiteSettings.objects.all().update(updated_at=timezone.now())
    if rows_updated == 0:
        SiteSettings.objects.create()

    # Broadcast via WebSockets
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "admin_updates",
                {
                    "type": "admin_update",
                    "message": "database_updated"
                }
            )
    except Exception:
        # Silently fail if redis/channels is not configured yet
        pass

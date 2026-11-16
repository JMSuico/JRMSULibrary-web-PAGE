# [Layer: Api/Controllers] — bulk_controller.py
import logging
import re

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from Features.Services.Implementations.tasks import (
    generic_bulk_delete_task,
    generic_bulk_hard_delete_task,
    generic_bulk_restore_task,
)

logger = logging.getLogger(__name__)

MAX_BULK_IDS = 500

ALLOWED_ENTITY_TYPES = frozenset({
    'USER',
    'PERSONNEL',
    'ERESOURCE_DEPT',
    'ERESOURCE_FILE',
    'GALLERY',
    'CMS_LINK',
    'CMS_FILE',
    'CONTACT',
    'BATCH',
    'REPORT',
    'RESEARCH_REF',
    'BOOK',
})

_VALID_STR_ID_RE = re.compile(r'^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$')


def _is_valid_bulk_id(item) -> bool:
    """Return True if item is a positive integer or a valid bounded string ID."""
    if isinstance(item, bool):
        return False
    if isinstance(item, int):
        return item > 0
    if isinstance(item, str):
        s = item.strip()
        if not s or s != item or len(s) > 64:
            return False
        if s.isdigit():
            return int(s) > 0
        return bool(_VALID_STR_ID_RE.fullmatch(s))
    return False


def _validate_ids(ids):
    """Validate that ids is a non-empty list of <= 500 valid positive integer or string IDs."""
    if not isinstance(ids, list) or len(ids) == 0:
        return None, "ids must be a non-empty list."
    if len(ids) > MAX_BULK_IDS:
        return None, f"Too many ids; maximum allowed per request is {MAX_BULK_IDS}."
    if not all(_is_valid_bulk_id(item) for item in ids):
        return None, "All ids must be positive integers or valid string IDs."
    return ids, None


class BulkActionViewSet(viewsets.ViewSet):
    """
    Universal bulk operation endpoint that offloads heavy deletions to Celery tasks.
    Requires Staff/Admin privileges.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def delete(self, request):
        entity_type = request.data.get('type')
        if not isinstance(entity_type, str) or entity_type not in ALLOWED_ENTITY_TYPES:
            return Response(
                {"detail": "Invalid or unsupported entity type."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_ids, err = _validate_ids(request.data.get('ids'))
        if err:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        try:
            generic_bulk_delete_task.delay(entity_type, validated_ids, request.user.id)
        except Exception:
            logger.exception("Failed to enqueue bulk delete task")
            return Response(
                {"detail": "Background task queue unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"detail": "Bulk delete processing in background"}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'])
    def restore(self, request):
        validated_ids, err = _validate_ids(request.data.get('ids'))
        if err:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        try:
            generic_bulk_restore_task.delay(validated_ids, request.user.id)
        except Exception:
            logger.exception("Failed to enqueue bulk restore task")
            return Response(
                {"detail": "Background task queue unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"detail": "Bulk restore processing in background"}, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'])
    def hard_delete(self, request):
        validated_ids, err = _validate_ids(request.data.get('ids'))
        if err:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        try:
            generic_bulk_hard_delete_task.delay(validated_ids, request.user.id)
        except Exception:
            logger.exception("Failed to enqueue bulk hard delete task")
            return Response(
                {"detail": "Background task queue unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"detail": "Bulk hard delete processing in background"}, status=status.HTTP_202_ACCEPTED)

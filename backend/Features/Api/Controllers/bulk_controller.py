# [Layer: Api/Controllers] — bulk_controller.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from Features.Services.Implementations.tasks import (
    generic_bulk_delete_task,
    generic_bulk_restore_task,
    generic_bulk_hard_delete_task
)

class BulkActionViewSet(viewsets.ViewSet):
    """
    Universal bulk operation endpoint that offloads heavy deletions to Celery tasks.
    Requires Staff/Admin privileges.
    """
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @action(detail=False, methods=['post'])
    def delete(self, request):
        entity_type = request.data.get('type')
        ids = request.data.get('ids', [])
        
        if not entity_type or not ids:
            return Response({"detail": "Missing type or ids"}, status=400)
            
        # Offload to Celery queue (Approach C)
        generic_bulk_delete_task.delay(entity_type, ids, request.user.id)
        
        # Instantly return accepted
        return Response({"detail": "Bulk delete processing in background"}, status=202)

    @action(detail=False, methods=['post'])
    def restore(self, request):
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({"detail": "Missing ids"}, status=400)
            
        generic_bulk_restore_task.delay(ids, request.user.id)
        return Response({"detail": "Bulk restore processing in background"}, status=202)

    @action(detail=False, methods=['post'])
    def hard_delete(self, request):
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({"detail": "Missing ids"}, status=400)
            
        generic_bulk_hard_delete_task.delay(ids, request.user.id)
        return Response({"detail": "Bulk hard delete processing in background"}, status=202)

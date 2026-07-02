# [Layer: Api/Controllers] — notification_controller.py
# Thin REST endpoint. Parses request, calls service, returns response.
# No business logic. No ORM queries. No helper logic.

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from Features.Services.Implementations.notification_service import NotificationService
from Features.Repositories.Implementations.notification_repository import NotificationRepository


class NotificationViewSet(viewsets.ViewSet):
    """Exposes GET /api/notifications/all/ for admin notification panel."""
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = NotificationService(NotificationRepository())

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Return all current notifications aggregated from system data."""
        data = self.service.get_all_notifications()
        return Response(data)

# [Layer: Api/Controllers] — health_controller.py
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from Features.Services.Implementations.health_service import HealthService
from Features.Services.Interfaces.i_health_service import IHealthService


class HealthCheckViewSet(viewsets.ViewSet):
    """
    Exposes /api/health/ for container readiness/liveness probes, verifying DB connectivity.
    """
    permission_classes = [permissions.AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service: IHealthService = HealthService()

    def list(self, request):
        payload = self.service.get_readiness_status()
        http_status = (
            status.HTTP_200_OK
            if payload.get("status") == "healthy"
            else status.HTTP_503_SERVICE_UNAVAILABLE
        )
        return Response(payload, status=http_status)

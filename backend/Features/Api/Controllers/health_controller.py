# [Layer: Api/Controllers] — health_controller.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response

class HealthCheckViewSet(viewsets.ViewSet):
    """
    Exposes a simple /api/health/ endpoint for Kubernetes readiness/liveness probes.
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        return Response({"status": "healthy"}, status=200)

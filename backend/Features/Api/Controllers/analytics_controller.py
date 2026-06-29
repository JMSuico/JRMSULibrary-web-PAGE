# [Layer: Api/Controllers] — analytics_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Api.Serializers.cms_serializers import SiteVisitSerializer
from Features.Repositories.Implementations.analytics_repository import SiteVisitRepository
from Features.Services.Implementations.analytics_service import SiteVisitService

class SiteVisitViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = SiteVisitService(SiteVisitRepository())

    def list(self, request):
        visits = self.service.get_all_visits()
        serializer = SiteVisitSerializer(visits, many=True)
        return Response(serializer.data)

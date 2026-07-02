# [Layer: Api/Controllers] — analytics_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from Features.Api.Serializers.cms_serializers import SiteVisitSerializer
from Features.Repositories.Implementations.analytics_repository import SiteVisitRepository
from Features.Services.Implementations.analytics_service import SiteVisitService
import datetime
from django.utils import timezone

class SiteVisitViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = SiteVisitService(SiteVisitRepository())

    def list(self, request):
        visits = self.service.get_all_visits()
        serializer = SiteVisitSerializer(visits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='count')
    def count(self, request):
        """Public endpoint: returns total visit count and this week's count."""
        all_visits = self.service.get_all_visits()
        total = len(all_visits)
        today = timezone.now().date()
        week_start = today - datetime.timedelta(days=6)
        this_week = len([v for v in all_visits if v.visited_at.date() >= week_start])
        return Response({'total_visits': total, 'this_week': this_week})

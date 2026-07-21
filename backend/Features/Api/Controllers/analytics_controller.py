# [Layer: Api/Controllers] — analytics_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from Features.Api.Serializers.cms_serializers import SiteVisitSerializer
from Features.Repositories.Implementations.analytics_repository import SiteVisitRepository
from Features.Services.Implementations.analytics_service import SiteVisitService
import datetime
from django.utils import timezone

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class SiteVisitViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperUser]

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
        total = self.service.get_count()
        today = timezone.now().date()
        week_start = today - datetime.timedelta(days=6)
        this_week = self.service.get_count_by_date_range(start_date=week_start)
        return Response({'total_visits': total, 'this_week': this_week})

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='track')
    def track(self, request):
        """Public endpoint: records a unique page visit for the day based on visitor_id or IP hash."""
        import hashlib
        
        page = request.data.get('page', '/')
        visitor_id = request.data.get('visitor_id')
        
        if visitor_id:
            raw_string = f"visitor-{visitor_id}"
        else:
            # Fallback to IP + UserAgent
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR', '')
                
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            raw_string = f"{ip}-{user_agent}"
            
        # Create an anonymized hash of the identifier
        ip_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        
        recorded = self.service.track_visit(page, ip_hash)
        
        if recorded:
            return Response({'status': 'recorded'}, status=status.HTTP_201_CREATED)
            
        return Response({'status': 'ignored_duplicate'}, status=status.HTTP_200_OK)

# [Layer: Repositories/Implementations] — analytics_repository.py
import datetime
from typing import List, Optional, Any
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from Features.Data.Models import SiteVisit
from Features.Repositories.Interfaces import ISiteVisitRepository

class SiteVisitRepository(ISiteVisitRepository):
    def get_all(self) -> List[Any]:
        return list(SiteVisit.objects.all())

    def get_count(self) -> int:
        return SiteVisit.objects.count()

    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        qs = SiteVisit.objects.all()
        if start_date:
            qs = qs.filter(visited_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(visited_at__date__lt=end_date)
        return qs.count()

    def get_count_by_month_year(self, month: int, year: int) -> int:
        return SiteVisit.objects.filter(visited_at__year=year, visited_at__month=month).count()

    def get_daily_counts(self, start_date, end_date) -> dict:
        qs = SiteVisit.objects.all()
        if start_date is not None:
            qs = qs.filter(visited_at__date__gte=start_date)
        if end_date is not None:
            qs = qs.filter(visited_at__date__lte=end_date)
        rows = (
            qs.annotate(day=TruncDate('visited_at'))
            .values('day')
            .annotate(count=Count('id'))
        )
        return {
            (row['day'].date() if isinstance(row['day'], datetime.datetime) else row['day']): row['count']
            for row in rows
            if row['day'] is not None
        }

    def get_monthly_counts(self, start_date) -> dict:
        qs = SiteVisit.objects.all()
        if start_date is not None:
            qs = qs.filter(visited_at__date__gte=start_date)
        rows = (
            qs.annotate(month=TruncMonth('visited_at'))
            .values('month')
            .annotate(count=Count('id'))
        )
        return {
            (row['month'].year, row['month'].month): row['count']
            for row in rows
            if row['month'] is not None
        }

    def track_visit(self, page: str, ip_hash: str) -> bool:
        from django.utils import timezone
        today = timezone.now().date()
        exists = SiteVisit.objects.filter(
            ip_hash=ip_hash,
            page=page,
            visited_at__date=today
        ).exists()
        
        if not exists:
            SiteVisit.objects.create(page=page, ip_hash=ip_hash)
            return True
        return False

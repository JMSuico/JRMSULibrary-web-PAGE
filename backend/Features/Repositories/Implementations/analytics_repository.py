# [Layer: Repositories/Implementations] — analytics_repository.py
from typing import List, Optional, Any
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

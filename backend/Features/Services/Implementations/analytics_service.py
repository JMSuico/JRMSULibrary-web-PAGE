# [Layer: Services/Implementations] — analytics_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import ISiteVisitService
from Features.Repositories.Interfaces import ISiteVisitRepository

class SiteVisitService(ISiteVisitService):
    def __init__(self, repo: ISiteVisitRepository):
        self._repo = repo

    def get_all_visits(self) -> List[Any]:
        return self._repo.get_all()

    def get_count(self) -> int:
        return self._repo.get_count()

    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        return self._repo.get_count_by_date_range(start_date, end_date)

    def get_count_by_month_year(self, month: int, year: int) -> int:
        return self._repo.get_count_by_month_year(month, year)

    def track_visit(self, page: str, ip_hash: str) -> bool:
        return self._repo.track_visit(page, ip_hash)

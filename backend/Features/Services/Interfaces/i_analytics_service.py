# [Layer: Services/Interfaces] — i_analytics_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ISiteVisitService(ABC):
    @abstractmethod
    def get_all_visits(self) -> List[Any]:
        pass

    @abstractmethod
    def get_count(self) -> int:
        pass

    @abstractmethod
    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        pass

    @abstractmethod
    def get_count_by_month_year(self, month: int, year: int) -> int:
        pass

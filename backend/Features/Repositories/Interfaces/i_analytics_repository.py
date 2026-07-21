# [Layer: Repositories/Interfaces] — i_analytics_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ISiteVisitRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
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

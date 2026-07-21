# [Layer: Services/Interfaces] — i_book_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class INewlyAcquiredBookService(ABC):
    @abstractmethod
    def get_all_books(self) -> List[Any]:
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

    @abstractmethod
    def get_recent(self, limit: int = 10):
        pass

    @abstractmethod
    def get_book_by_id(self, book_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def add_book(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update_book(self, book_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete_book(self, book_id: int) -> bool:
        pass

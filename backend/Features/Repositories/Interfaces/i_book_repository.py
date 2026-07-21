# [Layer: Repositories/Interfaces] — i_book_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class INewlyAcquiredBookRepository(ABC):
    @abstractmethod
    def get_books_by_batch(self, batch_id: int) -> List[Any]:
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
    def get_by_id(self, book_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, book_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, book_id: int) -> bool:
        pass

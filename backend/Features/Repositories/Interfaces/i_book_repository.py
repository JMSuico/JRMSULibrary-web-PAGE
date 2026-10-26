# [Layer: Repositories/Interfaces] — i_book_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class INewlyAcquiredBookRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

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
    def get_oldest(self, limit: int = 10):
        pass

    @abstractmethod
    def search(self, query: str = None, limit: int = 5) -> List[Any]:
        pass

    @abstractmethod
    def search_multi_token(self, tokens: List[str], limit: int = 5) -> List[Any]:
        pass

    @abstractmethod
    def get_inventory_summary(self) -> dict:
        pass

    @abstractmethod
    def get_by_id(self, book_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict, files: Optional[dict] = None) -> Any:
        pass

    @abstractmethod
    def update(self, book_id: int, data: dict, files: Optional[dict] = None) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, book_id: int) -> bool:
        pass

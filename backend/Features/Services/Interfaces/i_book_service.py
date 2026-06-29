from abc import ABC, abstractmethod
from typing import List, Optional, Any

class INewlyAcquiredBookService(ABC):
    @abstractmethod
    def get_all_books(self) -> List[Any]:
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

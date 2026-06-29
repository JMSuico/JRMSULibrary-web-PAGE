from abc import ABC, abstractmethod
from typing import List, Optional, Any

class INewlyAcquiredBookRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
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

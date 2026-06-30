# [Layer: Services/Interfaces] — i_batch_service.py
# Contract for Batch business logic

from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IBatchService(ABC):
    @abstractmethod
    def create_batch(self, data: dict, user_id: int) -> Any:
        pass

    @abstractmethod
    def add_book_to_batch(self, batch_id: int, data: dict, files: dict, user_id: int) -> Any:
        pass

    @abstractmethod
    def continue_batch(self, batch_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def close_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def archive_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def activate_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def reopen_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def get_current_display_batch(self) -> Optional[Any]:
        pass

    @abstractmethod
    def get_all_batches(self) -> List[Any]:
        pass

    @abstractmethod
    def get_batch_history(self, batch_id: int) -> List[Any]:
        pass

    @abstractmethod
    def update_batch(self, batch_id: int, data: dict, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def get_batch_by_id(self, batch_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def remove_book_from_batch(self, batch_id: int, book_id: int, user_id: int) -> bool:
        pass

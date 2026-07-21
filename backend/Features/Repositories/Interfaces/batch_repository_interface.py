# [Layer: Repositories/Interfaces] — batch_repository_interface.py
# Contract for Batch data access

from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IBatchRepository(ABC):
    @abstractmethod
    def get_current_display_batch(self) -> Optional[Any]:
        pass

    @abstractmethod
    def get_all_batches(self) -> List[Any]:
        pass

    @abstractmethod
    def get_batch_by_id(self, batch_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create_batch(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update_batch(self, batch_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def record_history(self, batch_id: int, action: str, details: str, user_id: Optional[int] = None) -> Any:
        pass

    @abstractmethod
    def get_batch_history(self, batch_id: int) -> List[Any]:
        pass

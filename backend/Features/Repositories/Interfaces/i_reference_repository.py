# [Layer: Repositories/Interfaces] — i_reference_repository.py
from abc import ABC, abstractmethod
from typing import Any, Optional, Tuple, List

class IResearchReferenceRepository(ABC):
    @abstractmethod
    def get_all(self) -> Any:
        pass

    @abstractmethod
    def get_by_id(self, reference_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def search(self, query: Optional[str] = None, category: Optional[str] = None, department: Optional[str] = None) -> Any:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def bulk_create(self, records_list: list) -> Tuple[int, list]:
        pass

    @abstractmethod
    def update(self, reference_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, reference_id: int) -> bool:
        pass

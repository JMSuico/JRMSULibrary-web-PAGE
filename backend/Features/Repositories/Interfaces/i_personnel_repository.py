# [Layer: Repositories/Interfaces] — i_personnel_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPersonnelRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id(self, personnel_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, personnel_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, personnel_id: int) -> bool:
        pass

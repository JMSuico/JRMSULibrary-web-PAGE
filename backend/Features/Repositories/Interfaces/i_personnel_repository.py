# [Layer: Repositories/Interfaces] — i_personnel_repository.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from Features.Data.Models import Personnel


class IPersonnelRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Personnel]:
        pass

    @abstractmethod
    def search_by_name_tokens(self, tokens: List[str]) -> List[Personnel]:
        pass

    @abstractmethod
    def get_by_id(self, personnel_id: int) -> Optional[Personnel]:
        pass

    @abstractmethod
    def create(self, data: Dict[str, object]) -> Personnel:
        pass

    @abstractmethod
    def update(self, personnel_id: int, data: Dict[str, object]) -> Optional[Personnel]:
        pass

    @abstractmethod
    def delete(self, personnel_id: int) -> bool:
        pass

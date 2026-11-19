# [Layer: Services/Interfaces] — i_personnel_service.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from Features.Data.Models import Personnel


class IPersonnelService(ABC):
    @abstractmethod
    def get_personnel_list(self) -> List[Personnel]:
        pass

    @abstractmethod
    def get_personnel_by_id(self, personnel_id: int) -> Optional[Personnel]:
        pass

    @abstractmethod
    def create_personnel(self, data: Dict[str, object]) -> Personnel:
        pass

    @abstractmethod
    def update_personnel(self, personnel_id: int, data: Dict[str, object]) -> Optional[Personnel]:
        pass

    @abstractmethod
    def delete_personnel(self, personnel_id: int, user_id: Optional[int] = None) -> bool:
        pass

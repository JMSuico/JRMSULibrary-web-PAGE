# [Layer: Services/Interfaces] — i_personnel_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPersonnelService(ABC):
    @abstractmethod
    def get_personnel_list(self) -> List[Any]:
        pass

    @abstractmethod
    def get_personnel_by_id(self, personnel_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create_personnel(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update_personnel(self, personnel_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete_personnel(self, personnel_id: int) -> bool:
        pass

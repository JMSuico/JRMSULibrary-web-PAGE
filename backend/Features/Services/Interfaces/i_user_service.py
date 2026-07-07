# [Layer: Services/Interfaces] — i_user_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IUserService(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, user_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        pass

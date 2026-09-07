# [Layer: Services/Interfaces] — i_reference_service.py
from abc import ABC, abstractmethod
from typing import Any, Optional, Tuple

class IResearchReferenceService(ABC):
    @abstractmethod
    def get_all_references(self, request=None, query=None, category=None, department=None) -> Any:
        pass

    @abstractmethod
    def get_reference_by_id(self, reference_id: int, request=None) -> Optional[Any]:
        pass

    @abstractmethod
    def create_reference(self, data: dict, request=None) -> Tuple[bool, Any]:
        pass

    @abstractmethod
    def update_reference(self, reference_id: int, data: dict, request=None) -> Tuple[bool, Any]:
        pass

    @abstractmethod
    def delete_reference(self, reference_id: int, user_id: Optional[int] = None) -> bool:
        pass

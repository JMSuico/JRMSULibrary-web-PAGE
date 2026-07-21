# [Layer: Services/Interfaces] — i_eresource_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IEResourceDepartmentService(ABC):
    @abstractmethod
    def get_departments(self) -> List[Any]:
        pass
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass
    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Any]:
        pass
    @abstractmethod
    def create(self, data: dict) -> Any:
        pass
    @abstractmethod
    def update(self, id: int, data: dict) -> Optional[Any]:
        pass
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass

class IEResourceFileService(ABC):
    @abstractmethod
    def get_all_files(self) -> List[Any]:
        pass
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass
    @abstractmethod
    def get_by_id(self, id: int) -> Optional[Any]:
        pass
    @abstractmethod
    def create(self, data: dict) -> Any:
        pass
    @abstractmethod
    def update(self, id: int, data: dict) -> Optional[Any]:
        pass
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass

# [Layer: Repositories/Interfaces] — i_cms_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPageContentRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Any]:
        pass

    @abstractmethod
    def update(self, slug: str, data: dict) -> Optional[Any]:
        pass

class IPageImageRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

class IManagedLinkRepository(ABC):
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

class IManagedFileRepository(ABC):
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
    def delete(self, id: int) -> bool:
        pass

    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

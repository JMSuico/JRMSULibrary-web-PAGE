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
    def get_all_active(self) -> List[Any]:
        pass

class IManagedFileRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

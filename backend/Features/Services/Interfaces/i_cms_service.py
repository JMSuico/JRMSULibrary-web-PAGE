# [Layer: Services/Interfaces] — i_cms_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPageContentService(ABC):
    @abstractmethod
    def get_all_content(self) -> List[Any]:
        pass

    @abstractmethod
    def get_content_by_slug(self, slug: str) -> Optional[Any]:
        pass

    @abstractmethod
    def update_content(self, slug: str, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def seed_defaults(self, defaults: list) -> int:
        pass

class IPageImageService(ABC):
    @abstractmethod
    def get_all_images(self) -> List[Any]:
        pass

class IManagedLinkService(ABC):
    @abstractmethod
    def get_all_links(self) -> List[Any]:
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
    def create_with_auto_order(self, data: dict) -> Any:
        pass
    @abstractmethod
    def import_defaults(self, links: list) -> int:
        pass
    @abstractmethod
    def update(self, id: int, data: dict) -> Optional[Any]:
        pass
    @abstractmethod
    def delete(self, id: int) -> bool:
        pass

class IManagedFileService(ABC):
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
    def delete(self, id: int) -> bool:
        pass

# [Layer: Services/Interfaces] — i_gallery_service.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ILibraryInteriorImageService(ABC):
    @abstractmethod
    def get_gallery_images(self) -> List[Any]:
        pass

    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id(self, image_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, image_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, image_id: int) -> bool:
        pass


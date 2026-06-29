from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ILibraryInteriorImageService(ABC):
    @abstractmethod
    def get_gallery_images(self) -> List[Any]:
        pass

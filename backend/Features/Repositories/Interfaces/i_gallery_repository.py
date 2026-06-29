from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ILibraryInteriorImageRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

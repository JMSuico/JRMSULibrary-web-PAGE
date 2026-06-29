from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPersonnelRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IPersonnelService(ABC):
    @abstractmethod
    def get_personnel_list(self) -> List[Any]:
        pass

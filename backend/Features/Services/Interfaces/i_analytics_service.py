from abc import ABC, abstractmethod
from typing import List, Optional, Any

class ISiteVisitService(ABC):
    @abstractmethod
    def get_all_visits(self) -> List[Any]:
        pass

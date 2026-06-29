from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IEResourceDepartmentRepository(ABC):
    @abstractmethod
    def get_root_departments(self) -> List[Any]:
        pass

class IEResourceFileRepository(ABC):
    @abstractmethod
    def get_all_active(self) -> List[Any]:
        pass

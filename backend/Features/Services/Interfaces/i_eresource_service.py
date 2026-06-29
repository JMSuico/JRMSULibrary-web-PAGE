from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IEResourceDepartmentService(ABC):
    @abstractmethod
    def get_departments(self) -> List[Any]:
        pass

class IEResourceFileService(ABC):
    @abstractmethod
    def get_all_files(self) -> List[Any]:
        pass

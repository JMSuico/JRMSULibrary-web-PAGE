# [Layer: Repositories/Interfaces] — i_report_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any, Tuple

class IReportRepository(ABC):
    @abstractmethod
    def create_report(self, title: str, report_type: str, date_range: str, generated_by: Any, report_data: dict) -> Any:
        pass

    @abstractmethod
    def get_history(self, search: str = '', limit: int = 10, offset: int = 0) -> Tuple[int, List[Any]]:
        pass

    @abstractmethod
    def get_report_by_id(self, report_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def archive_report(self, report_id: int) -> bool:
        pass

    @abstractmethod
    def unarchive_report(self, report_id: int) -> bool:
        pass

    @abstractmethod
    def get_archived_reports(self) -> List[Any]:
        pass

    @abstractmethod
    def delete_report(self, report_id: int) -> bool:
        pass

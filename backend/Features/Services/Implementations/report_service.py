# [Layer: Services/Implementations] — report_service.py
from typing import List, Optional, Any, Tuple
from Features.Services.Interfaces.i_report_service import IReportService
from Features.Repositories.Interfaces.i_report_repository import IReportRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository

class ReportService(IReportService):
    def __init__(self, repo: IReportRepository):
        self._repo = repo
        self._recycle_repo = RecycleBinRepository()

    def generate_and_save_report(self, title: str, report_type: str, date_range: str, generated_by: Any, report_data: dict) -> Any:
        return self._repo.create_report(title, report_type, date_range, generated_by, report_data)

    def get_history(self, search: str = '', limit: int = 10, offset: int = 0) -> Tuple[int, List[Any]]:
        return self._repo.get_history(search, limit, offset)

    def get_report_by_id(self, report_id: int) -> Optional[Any]:
        return self._repo.get_report_by_id(report_id)

    def archive_report(self, report_id: int) -> bool:
        return self._repo.archive_report(report_id)

    def unarchive_report(self, report_id: int) -> bool:
        return self._repo.unarchive_report(report_id)

    def get_archived_reports(self) -> List[Any]:
        return self._repo.get_archived_reports()

    def delete_report(self, report_id: int, user_id: int = None) -> bool:
        report = self._repo.get_report_by_id(report_id)
        if not report:
            return False

        snapshot = {
            "title": report.title,
            "report_type": report.report_type,
            "date_range": report.date_range,
            "report_data": report.report_data,
            "generated_by_id": report.generated_by.id if report.generated_by else None
        }

        self._recycle_repo.create(
            original_id=report.id,
            source_module='REPORT',
            item_name=f"{report.title} ({report.date_range})",
            data_snapshot=snapshot,
            user_id=user_id
        )

        return self._repo.delete_report(report_id)

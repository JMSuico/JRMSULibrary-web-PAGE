# [Layer: Repositories/Implementations] — report_repository.py
from typing import List, Optional, Any, Tuple
from django.db.models import Q
from Features.Data.Models.generated_report_model import GeneratedReport
from Features.Repositories.Interfaces.i_report_repository import IReportRepository

class ReportRepository(IReportRepository):
    def create_report(self, title: str, report_type: str, date_range: str, generated_by: Any, report_data: dict) -> Any:
        return GeneratedReport.objects.create(
            title=title,
            report_type=report_type,
            date_range=date_range,
            generated_by=generated_by,
            report_data=report_data
        )

    def get_history(self, search: str = '', limit: int = 10, offset: int = 0) -> Tuple[int, List[Any]]:
        qs = GeneratedReport.objects.filter(is_archived=False).order_by('-generated_at')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(report_type__icontains=search))
            
        total = qs.count()
        reports = list(qs[offset:offset+limit])
        return total, reports

    def get_report_by_id(self, report_id: int) -> Optional[Any]:
        try:
            return GeneratedReport.objects.get(pk=report_id)
        except GeneratedReport.DoesNotExist:
            return None

    def archive_report(self, report_id: int) -> bool:
        try:
            report = GeneratedReport.objects.get(pk=report_id)
            report.is_archived = True
            report.save()
            return True
        except GeneratedReport.DoesNotExist:
            return False

    def unarchive_report(self, report_id: int) -> bool:
        try:
            report = GeneratedReport.objects.get(pk=report_id)
            report.is_archived = False
            report.save()
            return True
        except GeneratedReport.DoesNotExist:
            return False

    def get_archived_reports(self) -> List[Any]:
        return list(GeneratedReport.objects.filter(is_archived=True).order_by('-generated_at'))

    def delete_report(self, report_id: int) -> bool:
        try:
            report = GeneratedReport.objects.get(pk=report_id)
            report.delete()
            return True
        except GeneratedReport.DoesNotExist:
            return False

    def create_report_from_snapshot(self, data: dict) -> Any:
        from Features.Data.Models.account_model import Account
        user_id = data.pop('generated_by_id', None)
        user = Account.objects.get(pk=user_id) if user_id else None
        
        return GeneratedReport.objects.create(
            title=data.get('title'),
            report_type=data.get('report_type'),
            date_range=data.get('date_range'),
            report_data=data.get('report_data'),
            generated_by=user
        )

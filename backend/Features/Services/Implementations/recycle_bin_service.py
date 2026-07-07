# [Layer: Services/Implementations] — recycle_bin_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import IRecycleBinService
from Features.Repositories.Interfaces import (
    IRecycleBinRepository, 
    INewlyAcquiredBookRepository, 
    ILibraryInteriorImageRepository
)

class RecycleBinService(IRecycleBinService):
    def __init__(self, 
                 repo: IRecycleBinRepository, 
                 book_repo: INewlyAcquiredBookRepository = None,
                 gallery_repo: ILibraryInteriorImageRepository = None,
                 report_repo=None):
        self._repo = repo
        self._book_repo = book_repo
        self._gallery_repo = gallery_repo
        self._report_repo = report_repo

    def get_all(self) -> List[Any]:
        return self._repo.get_all()

    def get_by_module(self, module: str) -> List[Any]:
        return self._repo.get_by_module(module)

    def restore_item(self, id: int) -> bool:
        item = self._repo.get_by_id(id)
        if not item:
            return False

        try:
            if item.source_module == 'BOOKS' and self._book_repo:
                data = dict(item.data_snapshot)
                if 'batch' in data:
                    data['batch_id'] = data.pop('batch')
                elif 'batch_id' in data:
                    data['batch_id'] = data.pop('batch_id')
                data.pop('id', None)
                self._book_repo.create(data)

            elif item.source_module == 'GALLERY' and self._gallery_repo:
                self._gallery_repo.create(item.data_snapshot)
                
            elif item.source_module == 'REPORT':
                from Features.Data.Models.generated_report_model import GeneratedReport
                from Features.Data.Models.account_model import Account
                
                data = dict(item.data_snapshot)
                user_id = data.pop('generated_by_id', None)
                user = Account.objects.get(pk=user_id) if user_id else None
                
                GeneratedReport.objects.create(
                    title=data.get('title'),
                    report_type=data.get('report_type'),
                    date_range=data.get('date_range'),
                    report_data=data.get('report_data'),
                    generated_by=user
                )

            else:
                success = getattr(self._repo, 'restore_entity', lambda x: False)(item)
                if not success:
                    return False

            self._repo.delete_permanently(id)
            return True
        except Exception as e:
            print(f"Restore failed: {e}")
            return False

    def delete_permanently(self, id: int) -> bool:
        return self._repo.delete_permanently(id)

    def auto_cleanup(self) -> int:
        # Cleanup items older than 30 days
        return self._repo.delete_older_than(30)

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
                 book_repo: INewlyAcquiredBookRepository,
                 gallery_repo: ILibraryInteriorImageRepository):
        self._repo = repo
        self._book_repo = book_repo
        self._gallery_repo = gallery_repo

    def get_all(self) -> List[Any]:
        return self._repo.get_all()

    def get_by_module(self, module: str) -> List[Any]:
        return self._repo.get_by_module(module)

    def restore_item(self, id: int) -> bool:
        item = self._repo.get_by_id(id)
        if not item:
            return False

        try:
            if item.source_module == 'BOOKS':
                # Remove ID to create a new record if original ID conflicts, or just create it
                data = item.data_snapshot
                # Handle batch_id if it was serialized
                if 'batch_id' in data:
                    data['batch_id'] = data.pop('batch_id')
                # we don't have files restored easily if it was an image path, but we can save the path
                self._book_repo.create(data)
            elif item.source_module == 'GALLERY':
                self._gallery_repo.create(item.data_snapshot)
            
            # Delete from recycle bin after successful restore
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

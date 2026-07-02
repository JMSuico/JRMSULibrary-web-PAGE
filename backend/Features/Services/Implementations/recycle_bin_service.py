# [Layer: Services/Implementations] — recycle_bin_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import IRecycleBinService
from Features.Repositories.Interfaces import (
    IRecycleBinRepository, 
    INewlyAcquiredBookRepository, 
    ILibraryInteriorImageRepository
)
from Features.Data.Models.acquisition_batch_model import AcquisitionBatch
from Features.Data.Models.newly_acquired_book_model import NewlyAcquiredBook
from Features.Data.Models.page_content_model import PageContent
from Features.Data.Models.page_image_model import PageImage
from Features.Data.Models.managed_link_model import ManagedLink
from Features.Data.Models.managed_file_model import ManagedFile
from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile
from Features.Data.Models.contact_message_model import ContactMessage

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
                data = dict(item.data_snapshot)
                # Handle batch_id if it was serialized as 'batch'
                if 'batch' in data:
                    data['batch_id'] = data.pop('batch')
                elif 'batch_id' in data:
                    data['batch_id'] = data.pop('batch_id')
                # Remove fields that can't be set directly on create
                data.pop('id', None)
                # we don't have files restored easily if it was an image path, but we can save the path
                self._book_repo.create(data)

            elif item.source_module == 'GALLERY':
                self._gallery_repo.create(item.data_snapshot)

            elif item.source_module == 'BATCH':
                snap = dict(item.data_snapshot)
                books_data = snap.pop('books', [])
                snap.pop('id', None)
                snap.pop('is_display_batch', None)  # restored batches start non-display

                # Recreate the batch
                batch = AcquisitionBatch.objects.create(
                    name=snap.get('name', 'Restored Batch'),
                    description=snap.get('description', ''),
                    status=snap.get('status', 'archived'),
                    is_display_batch=False,
                    remarks=snap.get('remarks', ''),
                )

                # Recreate the books under the new batch
                for book_data in books_data:
                    NewlyAcquiredBook.objects.create(
                        batch=batch,
                        title=book_data.get('title', ''),
                        author=book_data.get('author', ''),
                        accession_number=book_data.get('accession_number', ''),
                        category=book_data.get('category', ''),
                        # cover_image is a file path; we skip re-linking since file may be gone
                    )

            elif item.source_module == 'CMS_CONTENT':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                PageContent.objects.create(**snap)
                
            elif item.source_module == 'CMS_IMAGE':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                PageImage.objects.create(**snap)

            elif item.source_module == 'CMS_LINK':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                ManagedLink.objects.create(**snap)

            elif item.source_module == 'CMS_FILE':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                ManagedFile.objects.create(**snap)

            elif item.source_module == 'ERESOURCE_DEPT':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                EResourceDepartment.objects.create(**snap)

            elif item.source_module == 'ERESOURCE_FILE':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                dept_id = snap.pop('department', None)
                if dept_id:
                    dept = EResourceDepartment.objects.filter(id=dept_id).first()
                    if dept:
                        EResourceFile.objects.create(department=dept, **snap)

            elif item.source_module == 'CONTACT_MSG':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                ContactMessage.objects.create(**snap)

            # Remove from recycle bin after successful restore
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

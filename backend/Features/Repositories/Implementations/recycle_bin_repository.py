# [Layer: Repositories/Implementations] — recycle_bin_repository.py
from typing import List, Optional, Any
from datetime import timedelta
from django.utils import timezone
from Features.Data.Models import RecycleBin
from Features.Repositories.Interfaces import IRecycleBinRepository

from Features.Data.Models.acquisition_batch_model import AcquisitionBatch
from Features.Data.Models.newly_acquired_book_model import NewlyAcquiredBook
from Features.Data.Models.page_content_model import PageContent
from Features.Data.Models.page_image_model import PageImage
from Features.Data.Models.managed_link_model import ManagedLink
from Features.Data.Models.managed_file_model import ManagedFile
from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile
from Features.Data.Models.contact_message_model import ContactMessage
class RecycleBinRepository(IRecycleBinRepository):
    def get_all(self) -> List[Any]:
        return list(RecycleBin.objects.all())

    def get_by_module(self, module: str) -> List[Any]:
        return list(RecycleBin.objects.filter(source_module=module))

    def get_by_id(self, id: int) -> Optional[Any]:
        return RecycleBin.objects.filter(id=id).first()

    def create(self, original_id: int, source_module: str, item_name: str, data_snapshot: dict, user_id: int = None) -> Any:
        return RecycleBin.objects.create(
            original_id=original_id,
            source_module=source_module,
            item_name=item_name,
            data_snapshot=data_snapshot,
            deleted_by=user_id
        )

    def delete_permanently(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if obj:
            obj.delete()
            return True
        return False

    def delete_older_than(self, days: int) -> int:
        cutoff = timezone.now() - timedelta(days=days)
        deleted_count, _ = RecycleBin.objects.filter(deleted_at__lt=cutoff).delete()
        return deleted_count

    def restore_entity(self, item: Any) -> bool:
        try:
            if item.source_module == 'BATCH':
                snap = dict(item.data_snapshot)
                books_data = snap.pop('books', [])
                snap.pop('id', None)
                snap.pop('is_display_batch', None)

                batch = AcquisitionBatch.objects.create(
                    name=snap.get('name', 'Restored Batch'),
                    description=snap.get('description', ''),
                    status=snap.get('status', 'archived'),
                    is_display_batch=False,
                    remarks=snap.get('remarks', ''),
                )

                for book_data in books_data:
                    NewlyAcquiredBook.objects.create(
                        batch=batch,
                        title=book_data.get('title', ''),
                        author=book_data.get('author', ''),
                        accession_number=book_data.get('accession_number', ''),
                        category=book_data.get('category', ''),
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
                snap.pop('children', None)
                snap.pop('files', None)
                
                parent_id = snap.pop('parent', None)
                if parent_id:
                    # Verify parent still exists before attempting to link
                    if not EResourceDepartment.objects.filter(id=parent_id).exists():
                        parent_id = None
                
                EResourceDepartment.objects.create(parent_id=parent_id, **snap)

            elif item.source_module == 'ERESOURCE_FILE':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                snap.pop('children', None)
                snap.pop('files', None)
                
                dept_id = snap.pop('department', None)
                if dept_id:
                    dept = EResourceDepartment.objects.filter(id=dept_id).first()
                    if dept:
                        EResourceFile.objects.create(department=dept, **snap)

            elif item.source_module == 'CONTACT_MSG':
                snap = dict(item.data_snapshot)
                snap.pop('id', None)
                ContactMessage.objects.create(**snap)
                
            return True
        except Exception as e:
            print(f"Restore failed in ORM: {e}")
            return False

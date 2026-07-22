# [Layer: Services/Implementations] — batch_service.py
# Batch business logic implementation

from typing import List, Optional, Any
from django.db import transaction
from django.utils import timezone
from Features.Services.Interfaces.i_batch_service import IBatchService
from Features.Repositories.Implementations.batch_repository import BatchRepository
from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Data.Enums.batch_status import BatchStatus
from Features.Api.Serializers.cms_serializers import NewlyAcquiredBookSerializer

class BatchService(IBatchService):
    def __init__(self):
        self.batch_repo = BatchRepository()
        self.book_repo = NewlyAcquiredBookRepository()
        self.recycle_repo = RecycleBinRepository()

    @transaction.atomic
    def create_batch(self, data: dict, user_id: int) -> Any:
        data_copy = dict(data)
        # 1. Archive the previous display batch
        current = self.batch_repo.get_current_display_batch()
        if current:
            self.batch_repo.update_batch(current.id, {'status': BatchStatus.ARCHIVED, 'is_display_batch': False})
            self.batch_repo.record_history(current.id, "Archived Automatically", "Replaced by new batch", user_id)

        # 2. Create the new batch and set it as display batch
        data_copy['status'] = BatchStatus.OPEN
        data_copy['is_display_batch'] = True
        data_copy['created_by_id'] = user_id
        new_batch = self.batch_repo.create_batch(data_copy)
        self.batch_repo.record_history(new_batch.id, "Created", "New batch created and set as active display", user_id)
        
        return new_batch

    @transaction.atomic
    def add_book_to_batch(self, batch_id: int, data: dict, files: dict, user_id: int) -> Any:
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if not batch:
            raise ValueError("Batch not found")
        if batch.status != BatchStatus.OPEN:
            raise ValueError("Cannot add books to a closed or archived batch")
            
        data_copy = dict(data)
        data_copy['batch_id'] = batch_id
        book = self.book_repo.create(data_copy, files)
        self.batch_repo.record_history(batch_id, "Book Added", f"Added book: {book.title}", user_id)
        return book

    @transaction.atomic
    def update_book_in_batch(self, batch_id: int, book_id: int, data: dict, files: dict, user_id: int) -> Optional[Any]:
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if not batch:
            raise ValueError("Batch not found")
        if batch.status != BatchStatus.OPEN:
            raise ValueError("Cannot edit books in a closed or archived batch")
            
        book = self.book_repo.get_by_id(book_id)
        if not book or str(book.batch_id) != str(batch_id):
            return None
            
        updated_book = self.book_repo.update(book_id, data, files)
        self.batch_repo.record_history(batch_id, "Book Updated", f"Updated book: {updated_book.title}", user_id)
        return updated_book

    @transaction.atomic
    def remove_book_from_batch(self, batch_id: int, book_id: int, user_id: int) -> bool:
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if not batch:
            raise ValueError("Batch not found")
        book = self.book_repo.get_by_id(book_id)
        if not book or str(book.batch_id) != str(batch_id):
            return False
        title = book.title
        
        # Soft delete: move to recycle bin
        snapshot = NewlyAcquiredBookSerializer(book).data
        self.recycle_repo.create(
            original_id=book_id,
            source_module='BOOKS',
            item_name=title,
            data_snapshot=snapshot,
            user_id=user_id
        )

        deleted = self.book_repo.delete(book_id)
        if deleted:
            self.batch_repo.record_history(batch_id, "Book Removed", f"Removed book: {title}", user_id)
        return deleted

    def continue_batch(self, batch_id: int) -> Optional[Any]:
        # Mostly a read operation on frontend, returning the batch if it's OPEN
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if batch and batch.status == BatchStatus.OPEN:
            return batch
        raise ValueError("Cannot continue batch. It is not open.")

    @transaction.atomic
    def close_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        batch = self.batch_repo.update_batch(batch_id, {
            'status': BatchStatus.CLOSED,
            'closed_at': timezone.now(),
            'is_display_batch': False
        })
        if batch:
            self.batch_repo.record_history(batch_id, "Closed", "Batch closed for further additions and removed from display", user_id)
        return batch

    @transaction.atomic
    def archive_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        batch = self.batch_repo.update_batch(batch_id, {
            'status': BatchStatus.ARCHIVED,
            'is_display_batch': False
        })
        if batch:
            self.batch_repo.record_history(batch_id, "Archived", "Batch archived manually", user_id)
        return batch

    @transaction.atomic
    def activate_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        # Archive current
        current = self.batch_repo.get_current_display_batch()
        if current and current.id != batch_id:
            self.batch_repo.update_batch(current.id, {'status': BatchStatus.ARCHIVED, 'is_display_batch': False})
            self.batch_repo.record_history(current.id, "Archived", "Replaced by manual activation of another batch", user_id)
            
        # Activate target
        batch = self.batch_repo.update_batch(batch_id, {
            'is_display_batch': True
        })
        if batch:
            self.batch_repo.record_history(batch_id, "Activated", "Set as current display batch", user_id)
        return batch

    @transaction.atomic
    def reopen_batch(self, batch_id: int, user_id: int) -> Optional[Any]:
        batch = self.batch_repo.update_batch(batch_id, {
            'status': BatchStatus.OPEN,
            'closed_at': None
        })
        if batch:
            self.batch_repo.record_history(batch_id, "Reopened", "Batch reopened for additions", user_id)
        return batch

    @transaction.atomic
    def touch_batch(self, batch_id: int) -> Optional[Any]:
        # Simple save to trigger auto_now on last_interacted_at
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if batch:
            batch.save(update_fields=['last_interacted_at'])
            return batch
        return None

    def get_current_display_batch(self) -> Optional[Any]:
        return self.batch_repo.get_current_display_batch()

    def get_all_batches(self) -> List[Any]:
        return self.batch_repo.get_all_batches()

    def get_batch_history(self, batch_id: int) -> List[Any]:
        return self.batch_repo.get_batch_history(batch_id)

    @transaction.atomic
    def update_batch(self, batch_id: int, data: dict, user_id: int) -> Optional[Any]:
        # Intercept status changes to enforce business logic
        if 'status' in data:
            if data['status'] == BatchStatus.CLOSED or data['status'] == BatchStatus.ARCHIVED:
                data['is_display_batch'] = False
                if data['status'] == BatchStatus.CLOSED:
                    data['closed_at'] = timezone.now()
            elif data['status'] == BatchStatus.OPEN:
                # If reopening, make it the active display batch
                data['is_display_batch'] = True
                data['closed_at'] = None
                
                # Archive the current active batch if it's different
                current = self.batch_repo.get_current_display_batch()
                if current and current.id != batch_id:
                    self.batch_repo.update_batch(current.id, {'status': BatchStatus.ARCHIVED, 'is_display_batch': False})
                    self.batch_repo.record_history(current.id, "Archived Automatically", "Replaced by reopened batch", user_id)
        
        batch = self.batch_repo.update_batch(batch_id, data)
        if batch:
            self.batch_repo.record_history(batch_id, "Updated", "Batch metadata updated", user_id)
        return batch

    def get_batch_by_id(self, batch_id: int) -> Optional[Any]:
        return self.batch_repo.get_batch_by_id(batch_id)

    @transaction.atomic
    def delete_batch(self, batch_id: int, user_id: int = None) -> bool:
        batch = self.batch_repo.get_batch_by_id(batch_id)
        if not batch:
            return False

        books_snapshot = []
        for book in batch.books.all():
            books_snapshot.append({
                'title': book.title,
                'author': book.author,
                'accession_number': book.accession_number,
                'category': book.category,
                'cover_image': book.cover_image.name if book.cover_image else None,
                'date_encoded': book.date_encoded.isoformat() if book.date_encoded else None,
            })

        snapshot = {
            'id': batch.id,
            'name': batch.name,
            'description': batch.description,
            'status': batch.status,
            'is_display_batch': batch.is_display_batch,
            'opened_at': batch.opened_at.isoformat() if batch.opened_at else None,
            'closed_at': batch.closed_at.isoformat() if batch.closed_at else None,
            'remarks': batch.remarks,
            'books': books_snapshot,
        }

        self.recycle_repo.create(
            original_id=batch.id,
            source_module='BATCH',
            item_name=batch.name,
            data_snapshot=snapshot,
            user_id=user_id,
        )

        batch.delete()
        return True

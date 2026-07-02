# [Layer: Repositories/Implementations] — batch_repository.py
# Batch data access logic

from typing import List, Optional, Any
from django.db import transaction
from Features.Data.Models import AcquisitionBatch, BatchHistory
from Features.Repositories.Interfaces.batch_repository_interface import IBatchRepository

class BatchRepository(IBatchRepository):
    def get_current_display_batch(self) -> Optional[Any]:
        return AcquisitionBatch.objects.filter(is_display_batch=True).first()

    def get_all_batches(self) -> List[Any]:
        return list(AcquisitionBatch.objects.all())

    def get_batch_by_id(self, batch_id: int) -> Optional[Any]:
        try:
            return AcquisitionBatch.objects.get(id=batch_id)
        except AcquisitionBatch.DoesNotExist:
            return None

    def create_batch(self, data: dict) -> Any:
        return AcquisitionBatch.objects.create(**data)

    def update_batch(self, batch_id: int, data: dict) -> Optional[Any]:
        batch = self.get_batch_by_id(batch_id)
        if batch:
            for key, value in data.items():
                setattr(batch, key, value)
            batch.save()
            return batch
        return None

    def record_history(self, batch_id: int, action: str, details: str, user_id: Optional[int] = None) -> Any:
        return BatchHistory.objects.create(
            batch_id=batch_id,
            action=action,
            details=details,
            performed_by_id=user_id
        )

    def get_batch_history(self, batch_id: int) -> List[Any]:
        return list(BatchHistory.objects.filter(batch_id=batch_id))

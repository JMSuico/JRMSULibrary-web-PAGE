# [Layer: Repositories/Implementations] — recycle_bin_repository.py
from typing import List, Optional, Any
from datetime import timedelta
from django.utils import timezone
from Features.Data.Models import RecycleBin
from Features.Repositories.Interfaces import IRecycleBinRepository

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

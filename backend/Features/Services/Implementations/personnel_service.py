# [Layer: Services/Implementations] — personnel_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import IPersonnelService
from Features.Repositories.Interfaces import IPersonnelRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Api.Serializers.personnel_serializer import PersonnelSerializer

class PersonnelService(IPersonnelService):
    def __init__(self, repo: IPersonnelRepository):
        self._repo = repo

    def get_personnel_list(self) -> List[Any]:
        return self._repo.get_all()

    def get_personnel_by_id(self, personnel_id: int) -> Optional[Any]:
        return self._repo.get_by_id(personnel_id)

    def create_personnel(self, data: dict) -> Any:
        return self._repo.create(data)

    def update_personnel(self, personnel_id: int, data: dict) -> Optional[Any]:
        return self._repo.update(personnel_id, data)

    def delete_personnel(self, personnel_id: int, user_id: int = None) -> bool:
        personnel = self._repo.get_by_id(personnel_id)
        if not personnel:
            return False
            
        snapshot = PersonnelSerializer(personnel).data
        recycle_repo = RecycleBinRepository()
        recycle_repo.create(
            original_id=personnel_id,
            source_module='PERSONNEL',
            item_name=personnel.name or f"Personnel {personnel_id}",
            data_snapshot=snapshot,
            user_id=user_id
        )
        return self._repo.delete(personnel_id)

# [Layer: Services/Implementations] — personnel_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import IPersonnelService
from Features.Repositories.Interfaces import IPersonnelRepository

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

    def delete_personnel(self, personnel_id: int) -> bool:
        return self._repo.delete(personnel_id)

from typing import List, Optional, Any
from Features.Services.Interfaces import IEResourceDepartmentService, IEResourceFileService
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

class EResourceDepartmentService(IEResourceDepartmentService):
    def __init__(self, repo: IEResourceDepartmentRepository):
        self._repo = repo

    def get_departments(self) -> List[Any]:
        return self._repo.get_root_departments()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, id: int):
        return self._repo.get_by_id(id)

    def create(self, data: dict):
        return self._repo.create(data)

    def update(self, id: int, data: dict):
        return self._repo.update(id, data)

    def delete(self, id: int) -> bool:
        return self._repo.delete(id)


class EResourceFileService(IEResourceFileService):
    def __init__(self, repo: IEResourceFileRepository):
        self._repo = repo

    def get_all_files(self) -> List[Any]:
        return self._repo.get_all_active()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, id: int):
        return self._repo.get_by_id(id)

    def create(self, data: dict):
        return self._repo.create(data)

    def update(self, id: int, data: dict):
        return self._repo.update(id, data)

    def delete(self, id: int) -> bool:
        return self._repo.delete(id)

from typing import List, Optional, Any
from Features.Services.Interfaces import IEResourceDepartmentService, IEResourceFileService
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

class EResourceDepartmentService(IEResourceDepartmentService):
    def __init__(self, repo: IEResourceDepartmentRepository):
        self._repo = repo

    def get_departments(self) -> List[Any]:
        return self._repo.get_root_departments()

class EResourceFileService(IEResourceFileService):
    def __init__(self, repo: IEResourceFileRepository):
        self._repo = repo

    def get_all_files(self) -> List[Any]:
        return self._repo.get_all_active()

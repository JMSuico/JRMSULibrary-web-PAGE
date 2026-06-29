from typing import List, Optional, Any
from Features.Data.Models import EResourceDepartment, EResourceFile
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

class EResourceDepartmentRepository(IEResourceDepartmentRepository):
    def get_root_departments(self) -> List[Any]:
        return list(EResourceDepartment.objects.filter(parent__isnull=True))

class EResourceFileRepository(IEResourceFileRepository):
    def get_all_active(self) -> List[Any]:
        return list(EResourceFile.objects.filter(is_active=True))

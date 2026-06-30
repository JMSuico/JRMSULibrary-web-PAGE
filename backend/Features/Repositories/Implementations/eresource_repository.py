from typing import List, Optional, Any
from Features.Data.Models import EResourceDepartment, EResourceFile
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

class EResourceDepartmentRepository(IEResourceDepartmentRepository):
    def get_root_departments(self) -> List[Any]:
        return list(EResourceDepartment.objects.filter(parent=None))

    def get_all(self):
        return list(EResourceDepartment.objects.all())
        
    def get_by_id(self, id: int):
        return EResourceDepartment.objects.filter(id=id).first()

    def create(self, data: dict):
        return EResourceDepartment.objects.create(**data)

    def update(self, id: int, data: dict):
        EResourceDepartment.objects.filter(id=id).update(**data)
        return self.get_by_id(id)

    def delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if obj:
            obj.delete()
            return True
        return False


class EResourceFileRepository(IEResourceFileRepository):
    def get_all_active(self) -> List[Any]:
        return list(EResourceFile.objects.filter(is_active=True))

    def get_all(self):
        return list(EResourceFile.objects.all())
        
    def get_by_id(self, id: int):
        return EResourceFile.objects.filter(id=id).first()

    def create(self, data: dict):
        return EResourceFile.objects.create(**data)

    def update(self, id: int, data: dict):
        EResourceFile.objects.filter(id=id).update(**data)
        return self.get_by_id(id)

    def delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if obj:
            obj.delete()
            return True
        return False

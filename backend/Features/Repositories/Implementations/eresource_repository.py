# [Layer: Repositories/Implementations] — eresource_repository.py
from typing import List, Optional, Any
from django.db.models import Q
from Features.Data.Models import EResourceDepartment, EResourceFile
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

class EResourceDepartmentRepository(IEResourceDepartmentRepository):
    def get_root_departments(self) -> List[Any]:
        return list(EResourceDepartment.objects.filter(parent=None).order_by('order', 'id'))

    def get_all(self):
        return list(EResourceDepartment.objects.all())

    def get_all_with_parents(self) -> List[Any]:
        return list(EResourceDepartment.objects.select_related('parent', 'parent__parent').order_by('order', 'id'))
        
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

    def search_active_files(self, tokens: List[str], limit: int = 5) -> List[Any]:
        clean_tokens = [tok.strip() for tok in (tokens or []) if tok and tok.strip()]
        if not clean_tokens:
            return []
        query = Q()
        for tok in clean_tokens:
            query |= Q(name__icontains=tok) | Q(department__name__icontains=tok)
        return list(
            EResourceFile.objects.filter(is_active=True)
            .select_related('department', 'department__parent')
            .filter(query)
            .order_by('name')[:limit]
        )
        
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

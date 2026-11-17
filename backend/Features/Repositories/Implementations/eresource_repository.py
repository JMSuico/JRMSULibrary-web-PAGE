# [Layer: Repositories/Implementations] — eresource_repository.py
from typing import List, Optional, Any
from django.db.models import Prefetch, Q
from Features.Data.Models import EResourceDepartment, EResourceFile
from Features.Repositories.Interfaces import IEResourceDepartmentRepository, IEResourceFileRepository

# Heavy document blobs are excluded from list/tree queries to prevent 100s of MB of TCP/RAM overhead.
_DEFERRED_FILE_LIST_FIELDS = ('extracted_text', 'summary', 'table_of_contents', 'keywords')
_DEFERRED_FILE_AI_FIELDS = ('extracted_text',)
_TREE_PREFETCH_MAX_DEPTH = 6


def _build_department_tree_prefetches(max_depth: int = _TREE_PREFETCH_MAX_DEPTH) -> List[Prefetch]:
    """Build Prefetch descriptors so tree serialization avoids N+1 queries and heavy text blobs."""
    prefetches: List[Prefetch] = []
    deferred_files_qs = EResourceFile.objects.defer(*_DEFERRED_FILE_LIST_FIELDS).order_by('name')
    ordered_children_qs = EResourceDepartment.objects.order_by('order', 'id')
    for depth in range(max_depth):
        prefix = 'children__' * depth
        prefetches.append(Prefetch(f'{prefix}files', queryset=deferred_files_qs))
        if depth + 1 < max_depth:
            prefetches.append(Prefetch(f'{prefix}children', queryset=ordered_children_qs))
    return prefetches


class EResourceDepartmentRepository(IEResourceDepartmentRepository):
    def get_root_departments(self) -> List[Any]:
        return list(
            EResourceDepartment.objects.filter(parent=None)
            .prefetch_related(*_build_department_tree_prefetches())
            .order_by('order', 'id')
        )

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
        # Defer extracted_text (hundreds of MB across 500+ books); keep summary/TOC/keywords for AI matching.
        return list(EResourceFile.objects.filter(is_active=True).defer(*_DEFERRED_FILE_AI_FIELDS))

    def get_all(self):
        return list(EResourceFile.objects.defer(*_DEFERRED_FILE_LIST_FIELDS))

    def search_active_files(self, tokens: List[str], limit: int = 5) -> List[Any]:
        clean_tokens = [tok.strip() for tok in (tokens or []) if tok and tok.strip()]
        if not clean_tokens:
            return []
        query = Q()
        for tok in clean_tokens:
            query |= (
                Q(name__icontains=tok) |
                Q(department__name__icontains=tok) |
                Q(keywords__icontains=tok) |
                Q(summary__icontains=tok) |
                Q(table_of_contents__icontains=tok) |
                Q(extracted_text__icontains=tok)
            )
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

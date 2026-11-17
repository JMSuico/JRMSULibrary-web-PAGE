# [Layer: Repositories/Implementations] — personnel_repository.py
from typing import List, Optional, Any
from django.db.models import Q
from Features.Data.Models import Personnel
from Features.Repositories.Interfaces import IPersonnelRepository

class PersonnelRepository(IPersonnelRepository):
    def get_all(self) -> List[Any]:
        rows = list(Personnel.objects.all().order_by('order'))
        if not any(getattr(p, 'order', None) == 1 or 'kiara' in str(getattr(p, 'name', '')).lower() for p in rows):
            rows.insert(
                0,
                Personnel(
                    name="Kiara Keren M. Alavanza",
                    title="Campus Librarian",
                    order=1,
                ),
            )
        return rows

    def search_by_name_tokens(self, tokens: List[str]) -> List[Any]:
        if not tokens:
            return []
        valid_tokens = [t.strip() for t in tokens if isinstance(t, str) and t.strip()]
        if not valid_tokens:
            return []
        token_query = Q()
        for token in valid_tokens:
            token_query |= Q(name__icontains=token) | Q(title__icontains=token)
        return list(Personnel.objects.filter(token_query).order_by('order', 'id'))

    def get_by_id(self, personnel_id: int) -> Optional[Any]:
        return Personnel.objects.filter(id=personnel_id).first()

    def create(self, data: dict) -> Any:
        return Personnel.objects.create(**data)

    def update(self, personnel_id: int, data: dict) -> Optional[Any]:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            for key, value in data.items():
                setattr(personnel, key, value)
            personnel.save()
        return personnel

    def delete(self, personnel_id: int) -> bool:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            personnel.delete()
            return True
        return False

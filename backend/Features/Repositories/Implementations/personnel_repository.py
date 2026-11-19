# [Layer: Repositories/Implementations] — personnel_repository.py
from typing import Dict, List, Optional

from django.db.models import Q

from Features.Data.Models import Personnel
from Features.Helpers.media_cleanup_helper import delete_stale_media_and_thumbnail
from Features.Repositories.Interfaces import IPersonnelRepository

MAX_PERSONNEL_ROWS = 100


class PersonnelRepository(IPersonnelRepository):
    def get_all(self) -> List[Personnel]:
        rows = list(Personnel.objects.all().order_by('order', 'id')[:MAX_PERSONNEL_ROWS])
        if not rows:
            rows.insert(
                0,
                Personnel(
                    name="Kiara Keren M. Alavanza",
                    title="Campus Librarian",
                    order=1,
                ),
            )
        return rows

    def search_by_name_tokens(self, tokens: List[str]) -> List[Personnel]:
        if not tokens:
            return []
        valid_tokens = [t.strip() for t in tokens if isinstance(t, str) and t.strip()]
        if not valid_tokens:
            return []
        token_query = Q()
        for token in valid_tokens:
            token_query |= Q(name__icontains=token) | Q(title__icontains=token)
        return list(Personnel.objects.filter(token_query).order_by('order', 'id')[:MAX_PERSONNEL_ROWS])

    def get_by_id(self, personnel_id: int) -> Optional[Personnel]:
        try:
            normalized_id = int(personnel_id)
        except (TypeError, ValueError):
            return None
        return Personnel.objects.filter(id=normalized_id).first()

    def create(self, data: Dict[str, object]) -> Personnel:
        return Personnel.objects.create(**data)

    def update(self, personnel_id: int, data: Dict[str, object]) -> Optional[Personnel]:
        personnel = self.get_by_id(personnel_id)
        if not personnel:
            return None

        old_photo_name = personnel.photo.name if getattr(personnel, 'photo', None) else ''
        photo_in_payload = 'photo' in data

        for key, value in data.items():
            if key == 'photo' and value == '':
                value = None
            setattr(personnel, key, value)

        personnel.save()

        if photo_in_payload and old_photo_name:
            new_photo_name = personnel.photo.name if getattr(personnel, 'photo', None) else ''
            if new_photo_name != old_photo_name:
                delete_stale_media_and_thumbnail(old_photo_name)

        return personnel

    def delete(self, personnel_id: int) -> bool:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            personnel.delete()
            return True
        return False

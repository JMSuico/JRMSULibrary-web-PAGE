# [Layer: Repositories/Implementations] — personnel_repository.py
import os
from typing import Dict, List, Optional

from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Q

from Features.Data.Models import Personnel
from Features.Repositories.Interfaces import IPersonnelRepository

MAX_PERSONNEL_ROWS = 100


def _thumb_sidecar_name(image_name: str) -> str:
    stem, _ = os.path.splitext(image_name)
    return f"{stem}_thumb.webp"


def _delete_local_media_file_safely(real_media_root: str, relative_name: str) -> None:
    if not relative_name or "\x00" in relative_name:
        return
    candidate = os.path.join(real_media_root, relative_name)
    real_target = os.path.realpath(candidate)
    try:
        within_media_root = os.path.commonpath([real_media_root, real_target]) == real_media_root
    except ValueError:
        return
    if not within_media_root or real_target == real_media_root:
        return
    if os.path.isfile(real_target):
        try:
            os.remove(real_target)
        except OSError:
            pass


def _delete_stale_photo_and_sidecar(old_photo_name: str) -> None:
    if not old_photo_name or "\x00" in old_photo_name:
        return

    thumb_name = _thumb_sidecar_name(old_photo_name)

    if getattr(settings, "USE_S3_STORAGE", False):
        norm_name = old_photo_name.replace("\\", "/").lstrip("/")
        norm_thumb = thumb_name.replace("\\", "/").lstrip("/")
        if ".." in norm_name.split("/"):
            return
        for key in (norm_name, norm_thumb):
            try:
                default_storage.delete(key)
            except Exception:
                pass
        return

    media_root = getattr(settings, "MEDIA_ROOT", None)
    if not media_root:
        return

    real_media_root = os.path.realpath(str(media_root))
    _delete_local_media_file_safely(real_media_root, old_photo_name)
    _delete_local_media_file_safely(real_media_root, thumb_name)


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
                _delete_stale_photo_and_sidecar(old_photo_name)

        return personnel

    def delete(self, personnel_id: int) -> bool:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            personnel.delete()
            return True
        return False

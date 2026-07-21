# [Layer: Services/Implementations] — gallery_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import ILibraryInteriorImageService
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Api.Serializers.cms_serializers import LibraryInteriorImageSerializer

class LibraryInteriorImageService(ILibraryInteriorImageService):
    def __init__(self, repo: ILibraryInteriorImageRepository):
        self._repo = repo
        self._recycle_repo = RecycleBinRepository()

    def get_gallery_images(self):
        return self._repo.get_all_active()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, image_id: int):
        return self._repo.get_by_id(image_id)

    def create(self, data: dict):
        return self._repo.create(data)

    def update(self, image_id: int, data: dict):
        return self._repo.update(image_id, data)

    def delete(self, image_id: int, user_id: int = None) -> bool:
        item = self._repo.get_by_id(image_id)
        if item:
            snapshot = LibraryInteriorImageSerializer(item).data
            # Convert file field to string if needed, serializer should handle it
            self._recycle_repo.create(
                original_id=image_id,
                source_module='GALLERY',
                item_name=item.title or f"Section Image {image_id}",
                data_snapshot=snapshot,
                user_id=user_id
            )
        return self._repo.delete(image_id)

# [Layer: Services/Implementations] — gallery_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import ILibraryInteriorImageService
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Api.Serializers.cms_serializers import LibraryInteriorImageSerializer

class LibraryInteriorImageService(ILibraryInteriorImageService):
    def __init__(self, repo: ILibraryInteriorImageRepository = None):
        if repo is None:
            from Features.Repositories.Implementations.gallery_repository import LibraryInteriorImageRepository
            repo = LibraryInteriorImageRepository()
        self._repo = repo
        self._recycle_repo = RecycleBinRepository()

    def get_gallery_images(self):
        return self._repo.get_all_active()

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, image_id: int):
        return self._repo.get_by_id(image_id)

    @staticmethod
    def _prepare_gallery_data(data: dict) -> dict:
        from Features.Helpers.malware_scanner_helper import MalwareScannerHelper
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = dict(data)
        image = data_copy.get('image')
        if image and hasattr(image, 'read'):
            MalwareScannerHelper.verify_image_safety(image)
            data_copy['image'] = ImageOptimizerHelper.optimize_uploaded_image(image)
        return data_copy

    def create(self, data: dict):
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = self._prepare_gallery_data(data)
        item = self._repo.create(data_copy)
        if item and getattr(item, 'image', None):
            ImageOptimizerHelper.ensure_thumbnail_for_field(item.image)
        return item

    def update(self, image_id: int, data: dict):
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = self._prepare_gallery_data(data)
        item = self._repo.update(image_id, data_copy)
        if item and getattr(item, 'image', None) and 'image' in data_copy:
            ImageOptimizerHelper.ensure_thumbnail_for_field(item.image)
        return item

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

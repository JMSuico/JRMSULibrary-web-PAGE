from typing import List, Optional, Any
from Features.Services.Interfaces import ILibraryInteriorImageService
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository

class LibraryInteriorImageService(ILibraryInteriorImageService):
    def __init__(self, repo: ILibraryInteriorImageRepository):
        self._repo = repo

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

    def delete(self, image_id: int) -> bool:
        return self._repo.delete(image_id)

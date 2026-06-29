from typing import List, Optional, Any
from Features.Services.Interfaces import ILibraryInteriorImageService
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository

class LibraryInteriorImageService(ILibraryInteriorImageService):
    def __init__(self, repo: ILibraryInteriorImageRepository):
        self._repo = repo

    def get_gallery_images(self) -> List[Any]:
        return self._repo.get_all_active()

from typing import List, Optional, Any
from Features.Services.Interfaces import (
    IPageContentService, IPageImageService, IManagedLinkService, IManagedFileService
)
from Features.Repositories.Interfaces import (
    IPageContentRepository, IPageImageRepository, IManagedLinkRepository, IManagedFileRepository
)

class PageContentService(IPageContentService):
    def __init__(self, repo: IPageContentRepository):
        self._repo = repo

    def get_all_content(self) -> List[Any]:
        return self._repo.get_all()

    def get_content_by_slug(self, slug: str) -> Optional[Any]:
        return self._repo.get_by_slug(slug)

    def update_content(self, slug: str, data: dict) -> Optional[Any]:
        return self._repo.update(slug, data)

class PageImageService(IPageImageService):
    def __init__(self, repo: IPageImageRepository):
        self._repo = repo

    def get_all_images(self) -> List[Any]:
        return self._repo.get_all_active()

class ManagedLinkService(IManagedLinkService):
    def __init__(self, repo: IManagedLinkRepository):
        self._repo = repo

    def get_all_links(self) -> List[Any]:
        return self._repo.get_all_active()

class ManagedFileService(IManagedFileService):
    def __init__(self, repo: IManagedFileRepository):
        self._repo = repo

    def get_all_files(self) -> List[Any]:
        return self._repo.get_all_active()

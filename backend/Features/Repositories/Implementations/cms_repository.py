from typing import List, Optional, Any
from Features.Data.Models import PageContent, PageImage, ManagedLink, ManagedFile
from Features.Repositories.Interfaces import (
    IPageContentRepository, IPageImageRepository, IManagedLinkRepository, IManagedFileRepository
)

class PageContentRepository(IPageContentRepository):
    def get_all(self) -> List[Any]:
        return list(PageContent.objects.all())

    def get_by_slug(self, slug: str) -> Optional[Any]:
        try:
            return PageContent.objects.get(slug=slug)
        except PageContent.DoesNotExist:
            return None

    def update(self, slug: str, data: dict) -> Optional[Any]:
        content = self.get_by_slug(slug)
        if content:
            for key, value in data.items():
                setattr(content, key, value)
            content.save()
            return content
        return None

class PageImageRepository(IPageImageRepository):
    def get_all_active(self) -> List[Any]:
        return list(PageImage.objects.filter(is_active=True))

class ManagedLinkRepository(IManagedLinkRepository):
    def get_all_active(self) -> List[Any]:
        return list(ManagedLink.objects.filter(is_active=True))

class ManagedFileRepository(IManagedFileRepository):
    def get_all_active(self) -> List[Any]:
        return list(ManagedFile.objects.filter(is_active=True))

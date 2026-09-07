# [Layer: Repositories/Implementations] — cms_repository.py
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

    def seed_defaults(self, defaults: list) -> int:
        imported_count = 0
        existing_slugs = set(PageContent.objects.values_list('slug', flat=True))
        for d in defaults:
            if d['slug'] not in existing_slugs:
                PageContent.objects.create(slug=d['slug'], title=d['title'], content=d['content'])
                imported_count += 1
        return imported_count

class PageImageRepository(IPageImageRepository):
    def get_all_active(self) -> List[Any]:
        return list(PageImage.objects.filter(is_active=True))

class ManagedLinkRepository(IManagedLinkRepository):
    def get_all_active(self):
        return list(ManagedLink.objects.filter(is_active=True).order_by('order'))
        
    def get_all(self):
        return list(ManagedLink.objects.all().order_by('order'))
        
    def get_by_id(self, id: int):
        return ManagedLink.objects.filter(id=id).first()

    def get_max_order(self) -> int:
        max_link = ManagedLink.objects.all().order_by('-order').first()
        return max_link.order if max_link else 0

    def create(self, data: dict):
        return ManagedLink.objects.create(**data)

    def import_defaults(self, links: list) -> int:
        imported_count = 0
        existing_names = set(ManagedLink.objects.values_list('name', flat=True))
        for name, url, category in links:
            if name not in existing_names:
                max_order = self.get_max_order()
                ManagedLink.objects.create(name=name, url=url, category=category, order=max_order + 1)
                imported_count += 1
        return imported_count

    def update(self, id: int, data: dict):
        ManagedLink.objects.filter(id=id).update(**data)
        return self.get_by_id(id)

    def delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if obj:
            obj.delete()
            return True
        return False


class ManagedFileRepository(IManagedFileRepository):
    def get_all_active(self):
        return list(ManagedFile.objects.filter(is_active=True).order_by('-uploaded_at'))
        
    def get_all(self):
        return list(ManagedFile.objects.all().order_by('-uploaded_at'))
        
    def get_by_id(self, id: int):
        return ManagedFile.objects.filter(id=id).first()

    def create(self, data: dict):
        return ManagedFile.objects.create(**data)

    def delete(self, id: int) -> bool:
        obj = self.get_by_id(id)
        if obj:
            obj.delete()
            return True
        return False

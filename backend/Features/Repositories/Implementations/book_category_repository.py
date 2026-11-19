# [Layer: Repositories/Implementations] — book_category_repository.py
from typing import List, Optional

from Features.Data.Models import BookCategory, NewlyAcquiredBook
from Features.Repositories.Interfaces import IBookCategoryRepository


class BookCategoryRepository(IBookCategoryRepository):
    def get_all(self) -> List[BookCategory]:
        return list(BookCategory.objects.all().order_by('name'))

    def get_by_id(self, category_id: int) -> Optional[BookCategory]:
        return BookCategory.objects.filter(id=category_id).first()

    def get_by_name_ci(self, name: str) -> Optional[BookCategory]:
        if name is None:
            return None
        return BookCategory.objects.filter(name__iexact=name).first()

    def create(self, name: str) -> BookCategory:
        return BookCategory.objects.create(name=name)

    def update_name(self, category_id: int, new_name: str) -> Optional[BookCategory]:
        category = self.get_by_id(category_id)
        if not category:
            return None
        category.name = new_name
        category.save(update_fields=['name'])
        return category

    def delete_permanently(self, category_id: int) -> bool:
        category = self.get_by_id(category_id)
        if not category:
            return False
        category.delete()
        return True

    def sync_books_category_name(self, old_name: str, new_name: str) -> int:
        return NewlyAcquiredBook.objects.filter(category=old_name).update(category=new_name)

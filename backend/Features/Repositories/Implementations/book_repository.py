from typing import List, Optional, Any
from Features.Data.Models import NewlyAcquiredBook
from Features.Repositories.Interfaces import INewlyAcquiredBookRepository

class NewlyAcquiredBookRepository(INewlyAcquiredBookRepository):
    def get_all_active(self) -> List[Any]:
        return list(NewlyAcquiredBook.objects.filter(is_active=True))

    def get_by_id(self, book_id: int) -> Optional[Any]:
        try:
            return NewlyAcquiredBook.objects.get(id=book_id, is_active=True)
        except NewlyAcquiredBook.DoesNotExist:
            return None

    def create(self, data: dict) -> Any:
        return NewlyAcquiredBook.objects.create(**data)

    def update(self, book_id: int, data: dict) -> Optional[Any]:
        book = self.get_by_id(book_id)
        if book:
            for key, value in data.items():
                setattr(book, key, value)
            book.save()
            return book
        return None

    def delete(self, book_id: int) -> bool:
        book = self.get_by_id(book_id)
        if book:
            book.is_active = False
            book.save()
            return True
        return False

from typing import List, Optional, Any
from Features.Data.Models import NewlyAcquiredBook
from Features.Repositories.Interfaces import INewlyAcquiredBookRepository

class NewlyAcquiredBookRepository(INewlyAcquiredBookRepository):
    def get_all_active(self) -> List[Any]:
        return list(NewlyAcquiredBook.objects.all())

    def get_books_by_batch(self, batch_id: int) -> List[Any]:
        return list(NewlyAcquiredBook.objects.filter(batch_id=batch_id))

    def get_by_id(self, book_id: int) -> Optional[Any]:
        try:
            return NewlyAcquiredBook.objects.get(id=book_id)
        except NewlyAcquiredBook.DoesNotExist:
            return None

    def create(self, data: dict, files: dict = None) -> Any:
        book = NewlyAcquiredBook(**data)
        if files and 'cover_image' in files:
            book.cover_image = files['cover_image']
        book.save()
        return book


    def update(self, book_id: int, data: dict, files: dict = None) -> Optional[Any]:
        book = self.get_by_id(book_id)
        if book:
            for key, value in data.items():
                setattr(book, key, value)
            if files and 'cover_image' in files:
                book.cover_image = files['cover_image']
            book.save()
            return book
        return None

    def delete(self, book_id: int) -> bool:
        book = self.get_by_id(book_id)
        if book:
            book.delete()
            return True
        return False


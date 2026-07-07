# [Layer: Repositories/Implementations] — book_repository.py
from typing import List, Optional, Any
from Features.Data.Models import NewlyAcquiredBook
from Features.Repositories.Interfaces import INewlyAcquiredBookRepository

class NewlyAcquiredBookRepository(INewlyAcquiredBookRepository):
    def get_all_active(self) -> List[Any]:
        return list(NewlyAcquiredBook.objects.all())

    def get_count(self) -> int:
        return NewlyAcquiredBook.objects.count()

    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        qs = NewlyAcquiredBook.objects.all()
        if start_date:
            qs = qs.filter(date_encoded__date__gte=start_date)
        if end_date:
            qs = qs.filter(date_encoded__date__lt=end_date)
        return qs.count()

    def get_count_by_month_year(self, month: int, year: int) -> int:
        return NewlyAcquiredBook.objects.filter(date_encoded__year=year, date_encoded__month=month).count()

    def get_recent(self, limit: int = 10):
        return list(NewlyAcquiredBook.objects.all().order_by('-date_encoded')[:limit])

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


# [Layer: Repositories/Implementations] — book_repository.py
from typing import List, Optional, Any
from django.db.models import Q
from Features.Data.Models import NewlyAcquiredBook, AcquisitionBatch
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

    def get_oldest(self, limit: int = 10):
        return list(NewlyAcquiredBook.objects.all().order_by('date_encoded')[:limit])

    def search(self, query: str = None, limit: int = 5) -> List[Any]:
        if not query:
            return []
        return list(NewlyAcquiredBook.objects.filter(
            Q(title__icontains=query) | Q(author__icontains=query) | Q(category__icontains=query)
        )[:limit])

    def search_multi_token(self, tokens: List[str], limit: int = 5) -> List[Any]:
        if not tokens or limit <= 0:
            return []
        valid_tokens = [t.strip() for t in tokens if isinstance(t, str) and t.strip()]
        if not valid_tokens:
            return []
        token_query = Q()
        for token in valid_tokens:
            token_query |= (
                Q(title__icontains=token)
                | Q(author__icontains=token)
                | Q(category__icontains=token)
                | Q(accession_number__icontains=token)
            )
        return list(
            NewlyAcquiredBook.objects.exclude(
                Q(title__istartswith='IMG') | Q(category='Imported')
            ).filter(token_query)[:limit]
        )

    def get_inventory_summary(self) -> dict:
        total = NewlyAcquiredBook.objects.count()
        picture_count = NewlyAcquiredBook.objects.filter(
            Q(title__istartswith='IMG') | Q(category='Imported')
        ).count()
        named_count = max(0, total - picture_count)
        named_books = list(
            NewlyAcquiredBook.objects.exclude(
                Q(title__istartswith='IMG') | Q(category='Imported')
            )[:10]
        )
        active_batch = AcquisitionBatch.objects.filter(is_display_batch=True).first()
        display_batch_name = active_batch.name if active_batch else None

        return {
            "total": total,
            "picture_count": picture_count,
            "named_count": named_count,
            "named_books": named_books,
            "display_batch_name": display_batch_name,
        }

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

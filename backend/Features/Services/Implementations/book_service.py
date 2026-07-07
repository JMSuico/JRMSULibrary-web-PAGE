# [Layer: Services/Implementations] — book_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import INewlyAcquiredBookService
from Features.Repositories.Interfaces import INewlyAcquiredBookRepository

class NewlyAcquiredBookService(INewlyAcquiredBookService):
    def __init__(self, book_repository: INewlyAcquiredBookRepository):
        self._repo = book_repository

    def get_all_books(self) -> List[Any]:
        return self._repo.get_all_active()

    def get_count(self) -> int:
        return self._repo.get_count()

    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        return self._repo.get_count_by_date_range(start_date, end_date)

    def get_count_by_month_year(self, month: int, year: int) -> int:
        return self._repo.get_count_by_month_year(month, year)

    def get_recent(self, limit: int = 10):
        return self._repo.get_recent(limit)

    def get_book_by_id(self, book_id: int) -> Optional[Any]:
        return self._repo.get_by_id(book_id)

    def add_book(self, data: dict) -> Any:
        return self._repo.create(data)

    def update_book(self, book_id: int, data: dict) -> Optional[Any]:
        return self._repo.update(book_id, data)

    def delete_book(self, book_id: int) -> bool:
        return self._repo.delete(book_id)

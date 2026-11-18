# [Layer: Services/Implementations] — book_service.py
from typing import List, Optional, Any
from Features.Services.Interfaces import INewlyAcquiredBookService
from Features.Repositories.Interfaces import INewlyAcquiredBookRepository

class NewlyAcquiredBookService(INewlyAcquiredBookService):
    def __init__(self, book_repository: INewlyAcquiredBookRepository = None):
        if book_repository is None:
            from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
            book_repository = NewlyAcquiredBookRepository()
        self._repo = book_repository

    def get_all_books(self) -> List[Any]:
        return self._repo.get_all_active()

    def get_count(self) -> int:
        return self._repo.get_count()

    def get_count_by_date_range(self, start_date=None, end_date=None) -> int:
        return self._repo.get_count_by_date_range(start_date, end_date)

    def get_count_by_month_year(self, month: int, year: int) -> int:
        return self._repo.get_count_by_month_year(month, year)

    def get_monthly_counts(self, start_date) -> dict:
        return self._repo.get_monthly_counts(start_date)

    def get_recent(self, limit: int = 10):
        return self._repo.get_recent(limit)

    def get_book_by_id(self, book_id: int) -> Optional[Any]:
        return self._repo.get_by_id(book_id)

    @staticmethod
    def _prepare_book_data(data: dict) -> dict:
        from Features.Helpers.malware_scanner_helper import MalwareScannerHelper
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = dict(data)
        cover_image = data_copy.get('cover_image')
        if cover_image and hasattr(cover_image, 'read'):
            MalwareScannerHelper.verify_image_safety(cover_image)
            data_copy['cover_image'] = ImageOptimizerHelper.optimize_uploaded_image(cover_image)
        return data_copy

    def add_book(self, data: dict) -> Any:
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = self._prepare_book_data(data)
        book = self._repo.create(data_copy)
        if book and getattr(book, 'cover_image', None):
            ImageOptimizerHelper.ensure_thumbnail_for_field(book.cover_image)
        return book

    def update_book(self, book_id: int, data: dict) -> Optional[Any]:
        from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper

        data_copy = self._prepare_book_data(data)
        book = self._repo.update(book_id, data_copy)
        if book and getattr(book, 'cover_image', None) and 'cover_image' in data_copy:
            ImageOptimizerHelper.ensure_thumbnail_for_field(book.cover_image)
        return book

    def delete_book(self, book_id: int) -> bool:
        return self._repo.delete(book_id)

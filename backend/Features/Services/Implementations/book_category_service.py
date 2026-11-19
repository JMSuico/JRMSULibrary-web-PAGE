# [Layer: Services/Implementations] - book_category_service.py
# Book category business logic implementation

import re
from typing import List, Optional
from django.db import transaction
from Features.Data.Models import BookCategory
from Features.Services.Interfaces.i_book_category_service import IBookCategoryService
from Features.Repositories.Interfaces.i_book_category_repository import IBookCategoryRepository
from Features.Repositories.Implementations.book_category_repository import BookCategoryRepository


class BookCategoryService(IBookCategoryService):
    """Business logic for creating, renaming, listing, and permanently deleting book categories."""

    def __init__(self, repo: Optional[IBookCategoryRepository] = None):
        """Initialize the service with a book category repository."""
        self._repo = repo if repo is not None else BookCategoryRepository()

    @staticmethod
    def _clean_name(raw_name: object) -> str:
        """Strip HTML tags and null bytes, validating length while preserving characters like ampersands."""
        if not isinstance(raw_name, str):
            raise ValueError("Category name must be a non-empty string")
        cleaned = re.sub(r'<[^>]*>', '', raw_name).replace('\x00', '').strip()
        if not cleaned:
            raise ValueError("Category name cannot be empty")
        if len(cleaned) > 100:
            raise ValueError("Category name must be 100 characters or fewer")
        return cleaned

    def get_all_categories(self) -> List[BookCategory]:
        """Return all book categories from the repository."""
        return self._repo.get_all()

    def create_category(self, raw_name: object) -> BookCategory:
        """Create a new category after sanitization and case-insensitive uniqueness checks."""
        name = self._clean_name(raw_name)
        if self._repo.get_by_name_ci(name):
            raise ValueError("Category already exists")
        return self._repo.create(name)

    @transaction.atomic
    def rename_category(self, category_id: int, raw_name: object) -> Optional[BookCategory]:
        """Rename a category atomically and sync matching books when the name changes."""
        clean = self._clean_name(raw_name)
        existing = self._repo.get_by_id(category_id)
        if not existing:
            return None

        existing_ci = self._repo.get_by_name_ci(clean)
        if existing_ci and str(existing_ci.id) != str(category_id):
            raise ValueError("Category already exists")

        old_name = existing.name
        updated = self._repo.update_name(category_id, clean)
        if old_name != clean:
            self._repo.sync_books_category_name(old_name, clean)
        return updated

    def delete_category_permanently(self, category_id: int) -> bool:
        """Permanently delete a category without recording an entry in the RecycleBin."""
        return self._repo.delete_permanently(category_id)

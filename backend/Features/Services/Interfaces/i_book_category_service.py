# [Layer: Services/Interfaces] - i_book_category_service.py
from abc import ABC, abstractmethod
from typing import List, Optional
from Features.Data.Models import BookCategory


class IBookCategoryService(ABC):
    """Service interface for managing book categories."""

    @abstractmethod
    def get_all_categories(self) -> List[BookCategory]:
        """Return all persisted book categories."""
        pass

    @abstractmethod
    def create_category(self, raw_name: object) -> BookCategory:
        """Validate, sanitize, and create a new book category."""
        pass

    @abstractmethod
    def rename_category(self, category_id: int, raw_name: object) -> Optional[BookCategory]:
        """Rename an existing book category and sync books referencing the old name."""
        pass

    @abstractmethod
    def delete_category_permanently(self, category_id: int) -> bool:
        """Permanently delete a book category without creating a RecycleBin entry."""
        pass

# [Layer: Repositories/Interfaces] — i_book_category_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional

from Features.Data.Models import BookCategory


class IBookCategoryRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[BookCategory]:
        pass

    @abstractmethod
    def get_by_id(self, category_id: int) -> Optional[BookCategory]:
        pass

    @abstractmethod
    def get_by_name_ci(self, name: str) -> Optional[BookCategory]:
        pass

    @abstractmethod
    def create(self, name: str) -> BookCategory:
        pass

    @abstractmethod
    def update_name(self, category_id: int, new_name: str) -> Optional[BookCategory]:
        pass

    @abstractmethod
    def delete_permanently(self, category_id: int) -> bool:
        pass

    @abstractmethod
    def sync_books_category_name(self, old_name: str, new_name: str) -> int:
        pass

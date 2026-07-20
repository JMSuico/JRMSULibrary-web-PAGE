# [Layer: Repositories/Interfaces] — i_user_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional, Any

class IUserRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, user_id: int, data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Any]:
        pass

    @abstractmethod
    def username_exists_exclude_user(self, username: str, exclude_user_id: int) -> bool:
        pass

    @abstractmethod
    def email_exists_exclude_user(self, email: str, exclude_user_id: int) -> bool:
        pass

    @abstractmethod
    def clear_user_sessions(self, user_id: int, current_session_key: str = None):
        pass

    @abstractmethod
    def clear_all_sessions_and_status(self):
        pass

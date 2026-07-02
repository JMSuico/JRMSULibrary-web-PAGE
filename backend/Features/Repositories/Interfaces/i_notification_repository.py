# [Layer: Repositories/Interfaces] — i_notification_repository.py
# Abstract contract for notification data access.
# Only defines contracts. No business logic. No ORM queries.

from abc import ABC, abstractmethod
from typing import List, Any


class INotificationRepository(ABC):

    @abstractmethod
    def get_total_visit_count(self) -> int:
        """Return total SiteVisit count from the database."""
        pass

    @abstractmethod
    def get_unread_emails(self, limit: int) -> List[Any]:
        """Return list of unread ContactMessages of type EMAIL."""
        pass

    @abstractmethod
    def get_replied_emails(self, limit: int) -> List[Any]:
        """Return list of replied ContactMessages of type EMAIL."""
        pass

    @abstractmethod
    def get_unread_reservations(self, limit: int) -> List[Any]:
        """Return list of unread ContactMessages of type RESERVATION."""
        pass

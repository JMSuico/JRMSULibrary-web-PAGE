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

    @abstractmethod
    def get_unread_credential_requests(self, limit: int) -> List[Any]:
        """Return list of unread ContactMessages of type CREDENTIAL_REQUEST."""
        pass

    @abstractmethod
    def get_total_unread_count(self) -> int:
        """Return total count of unread ContactMessages across all types."""
        pass

    @abstractmethod
    def mark_all_unread_as_read(self) -> None:
        """Mark all unread ContactMessages as read."""
        pass

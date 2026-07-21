# [Layer: Repositories/Interfaces] — contact_repository_interface.py
# Contract for contact data access.
# Do NOT put business rules here — interfaces define what, not how.

from abc import ABC, abstractmethod


class ContactRepositoryInterface(ABC):

    @abstractmethod
    def create(self, data: dict):
        """Persist a new contact message."""
        pass

    @abstractmethod
    def get_all(self):
        """Retrieve all contact messages."""
        pass

    @abstractmethod
    def get_count_by_type_and_date(self, message_type: str, start_date=None, end_date=None) -> int:
        pass

    @abstractmethod
    def get_recent(self, limit: int = 10):
        pass

    @abstractmethod
    def get_by_id(self, message_id: int):
        """Retrieve a single contact message by ID."""
        pass

    @abstractmethod
    def mark_as_read(self, message_id: int):
        """Mark a contact message as read."""
        pass

    @abstractmethod
    def update_status(self, message_id: int, status: str):
        """Update the status of a contact message."""
        pass

    @abstractmethod
    def get_recent_by_email_and_type(self, email: str, message_type: str, hours: int = 1):
        pass

    @abstractmethod
    def get_replies_by_email(self, email: str):
        pass

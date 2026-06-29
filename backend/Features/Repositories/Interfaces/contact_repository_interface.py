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
    def get_by_id(self, message_id: int):
        """Retrieve a single contact message by ID."""
        pass

    @abstractmethod
    def mark_as_read(self, message_id: int):
        """Mark a contact message as read."""
        pass

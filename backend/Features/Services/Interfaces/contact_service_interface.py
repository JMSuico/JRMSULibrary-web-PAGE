# [Layer: Services/Interfaces] — contact_service_interface.py
# Contract for contact workflow.
# Do NOT put DB queries or HTTP concerns here.

from abc import ABC, abstractmethod


class ContactServiceInterface(ABC):

    @abstractmethod
    def submit_contact(self, data: dict):
        """Validate, sanitize, persist contact, and trigger email notification."""
        pass

    @abstractmethod
    def get_all_messages(self):
        """Retrieve all contact messages."""
        pass

    @abstractmethod
    def get_count_by_type_and_date(self, message_type: str, start_date=None, end_date=None) -> int:
        pass

    @abstractmethod
    def get_recent(self, limit: int = 10):
        pass

    @abstractmethod
    def mark_message_read(self, message_id: int):
        """Mark a contact message as read."""
        pass

    @abstractmethod
    def update_message_status(self, message_id: int, status: str):
        """Update the status of a contact message."""
        pass

    @abstractmethod
    def upload_attachment(self, file) -> dict:
        """Uploads an attachment file and returns file info."""
        pass

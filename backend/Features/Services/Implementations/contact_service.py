# [Layer: Services/Implementations] — contact_service.py
# Validates contact form, sanitizes input, triggers email, calls repository.
# Do NOT query database directly — use ContactRepository only.

from Features.Repositories.Implementations.contact_repository import ContactRepository
from Features.Helpers.input_sanitizer import sanitize_input
from Features.Services.Interfaces.contact_service_interface import ContactServiceInterface


class ContactService(ContactServiceInterface):

    def __init__(self):
        self.repository = ContactRepository()

    def submit_contact(self, data: dict):
        sanitized = {
            'name': sanitize_input(data.get('name', '')),
            'email': sanitize_input(data.get('email', '')),
            'message': sanitize_input(data.get('message', '')),
        }
        message = self.repository.create(sanitized)
        # TODO: Trigger email notification to library staff
        return message

    def get_all_messages(self):
        return self.repository.get_all()

    def mark_message_read(self, message_id: int):
        return self.repository.mark_as_read(message_id)

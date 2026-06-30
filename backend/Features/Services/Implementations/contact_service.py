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
            'subject': sanitize_input(data.get('subject', '')),
            'message': sanitize_input(data.get('message', '')),
            'message_type': sanitize_input(data.get('message_type', 'EMAIL')),
        }

        # Batching logic: check if same email sent same type of message within last hour
        recent_message = self.repository.get_recent_by_email_and_type(
            email=sanitized['email'],
            message_type=sanitized['message_type'],
            hours=1
        )

        if recent_message:
            # Append new message to the existing one
            new_text = f"\n\n--- Added later ---\nSubject: {sanitized['subject']}\nMessage: {sanitized['message']}"
            recent_message.message += new_text
            # If it was read or replied, mark it as unread again since there's new content
            recent_message.status = 'UNREAD'
            recent_message.is_read = False
            recent_message.save()
            return recent_message
        else:
            message = self.repository.create(sanitized)
            # TODO: Trigger email notification to library staff
            return message

    def update_message_status(self, message_id: int, status: str):
        return self.repository.update_status(message_id, status)


    def get_all_messages(self):
        return self.repository.get_all()

    def mark_message_read(self, message_id: int):
        return self.repository.mark_as_read(message_id)

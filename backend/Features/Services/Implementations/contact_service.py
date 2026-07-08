# [Layer: Services/Implementations] — contact_service.py
# Validates contact form, sanitizes input, triggers email, calls repository.
# Do NOT query database directly — use ContactRepository only.

from Features.Repositories.Implementations.contact_repository import ContactRepository
from Features.Repositories.Implementations.recycle_bin_repository import RecycleBinRepository
from Features.Api.Serializers.contact_serializer import ContactMessageSerializer
from Features.Helpers.input_sanitizer import sanitize_input
from Features.Helpers.email_helper import (
    is_disposable_email,
    is_email_domain_valid,
    send_reply_email,
    send_notification_to_library,
    send_approval_email,
    send_decline_email,
    send_reply_with_attachments
)
from Features.Services.Interfaces.contact_service_interface import ContactServiceInterface
import threading
import logging

logger = logging.getLogger(__name__)


class ContactService(ContactServiceInterface):

    def __init__(self):
        self.repository = ContactRepository()
        self.recycle_repository = RecycleBinRepository()

    def submit_contact(self, data: dict):
        sanitized = {
            'name': sanitize_input(data.get('name', '')),
            'email': sanitize_input(data.get('email', '')),
            'subject': sanitize_input(data.get('subject', '')),
            'message': sanitize_input(data.get('message', '')),
            'message_type': sanitize_input(data.get('message_type', 'EMAIL')),
        }

        email = sanitized['email']

        # --- Disposable / Temporary Email Detection ---
        # TODO(Temporary): Commented out for testing fake emails per user request
        # if is_disposable_email(email):
        #     raise ValueError(f"Temporary or disposable email addresses are not accepted: {email}")

        # if not is_email_domain_valid(email):
        #     raise ValueError(f"The email domain appears to be invalid or unreachable: {email}")

        # Batching logic: check if same email sent same type of message within last hour
        recent_message = self.repository.get_recent_by_email_and_type(
            email=email,
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
            message = recent_message
        else:
            message = self.repository.create(sanitized)

        # Fire-and-forget: notify library staff via email (non-blocking)
        threading.Thread(
            target=send_notification_to_library,
            args=(sanitized['name'], email, sanitized['subject'], sanitized['message']),
            daemon=True
        ).start()

        return message

    def reply_to_message(self, message_id: int, reply_body: str, send_to_chatbot: bool = False) -> dict:
        """
        Sends an email reply to the user and marks the message as REPLIED.
        Optionally saves reply_text to DB so it appears in the Rizal Chatbot.
        """
        message = self.repository.get_by_id(message_id)
        if not message:
            raise ValueError(f"Message with id={message_id} not found.")

        from django.utils import timezone

        # Conditionally save to DB for Rizal Chatbot visibility
        if send_to_chatbot:
            message.reply_text = reply_body
            message.replied_at = timezone.now()
            message.save()

        self.repository.update_status(message_id, 'REPLIED')

        # Send email
        success = send_reply_email(
            to_email=message.email,
            to_name=message.name,
            subject=message.subject or "Your inquiry",
            reply_body=reply_body,
        )

        channels = []
        if success:
            channels.append('Email')
        if send_to_chatbot:
            channels.append('Chatbot')

        if success:
            return {'success': True, 'detail': f'Reply sent via: {", ".join(channels)} to {message.email}'}
        else:
            detail = 'Failed to send email. Check SMTP configuration.'
            if send_to_chatbot:
                detail = 'Reply saved to Chatbot, but email failed. Check SMTP configuration.'
            return {'success': send_to_chatbot, 'detail': detail}

    def update_message_status(self, message_id: int, status: str):
        message = self.repository.update_status(message_id, status)
        if status == 'APPROVED':
            send_approval_email(message.email, message.name, message.subject or "Your inquiry")
        elif status == 'DECLINED':
            send_decline_email(message.email, message.name, message.subject or "Your inquiry")
        return message

    def reply_with_attachment(self, message_id: int, reply_body: str, file_entries: list, send_to_chatbot: bool = False) -> dict:
        message = self.repository.get_by_id(message_id)
        if not message:
            raise ValueError(f"Message with id={message_id} not found.")

        from django.utils import timezone

        # Conditionally save to DB for Rizal Chatbot visibility
        if send_to_chatbot:
            message.reply_text = reply_body
            message.replied_at = timezone.now()
            message.save()

        self.repository.update_status(message_id, 'REPLIED')

        # Send email with attachments
        success = send_reply_with_attachments(
            to_email=message.email,
            to_name=message.name,
            subject=message.subject or "Your inquiry",
            reply_body=reply_body,
            file_entries=file_entries
        )

        channels = []
        if success:
            channels.append('Email')
        if send_to_chatbot:
            channels.append('Chatbot')

        if success:
            return {'success': True, 'detail': f'Reply sent via: {", ".join(channels)} to {message.email}'}
        else:
            detail = 'Failed to send email. Check SMTP configuration.'
            if send_to_chatbot:
                detail = 'Reply saved to Chatbot, but email failed. Check SMTP configuration.'
            return {'success': send_to_chatbot, 'detail': detail}

    def get_all_messages(self):
        return self.repository.get_all()

    def get_count_by_type_and_date(self, message_type: str, start_date=None, end_date=None) -> int:
        return self.repository.get_count_by_type_and_date(message_type, start_date, end_date)

    def get_recent(self, limit: int = 10):
        return self.repository.get_recent(limit)

    def mark_message_read(self, message_id: int):
        return self.repository.mark_as_read(message_id)

    def get_replies_by_email(self, email: str):
        # Only return messages that have a reply
        return self.repository.model.objects.filter(
            email=email, 
            status='REPLIED'
        ).exclude(reply_text__isnull=True).order_by('-replied_at')

    def delete_message(self, message_id: int, user_id: int = None) -> bool:
        message = self.repository.get_by_id(message_id)
        if message:
            snapshot = ContactMessageSerializer(message).data
            self.recycle_repository.create(
                original_id=message.id,
                source_module='CONTACT_MSG',
                item_name=message.subject or f"Message from {message.email}",
                data_snapshot=snapshot,
                user_id=user_id
            )
            message.delete()
            return True
        return False

# [Layer: Repositories/Implementations] — notification_repository.py
# Concrete implementation of INotificationRepository.
# ORM queries only. No business logic. No HTTP concerns.

from Features.Repositories.Interfaces.i_notification_repository import INotificationRepository
from Features.Data.Models.contact_message_model import ContactMessage
from Features.Data.Models.site_visit_model import SiteVisit


class NotificationRepository(INotificationRepository):

    def get_total_visit_count(self) -> int:
        return SiteVisit.objects.count()

    def get_unread_emails(self, limit: int = 5):
        return list(
            ContactMessage.objects.filter(
                message_type='EMAIL',
                status='UNREAD'
            ).order_by('-created_at')[:limit]
        )

    def get_replied_emails(self, limit: int = 5):
        return list(
            ContactMessage.objects.filter(
                message_type='EMAIL',
                status='REPLIED'
            ).order_by('-created_at')[:limit]
        )

    def get_unread_reservations(self, limit: int) -> List[Any]:
        return list(
            ContactMessage.objects.filter(
                message_type='RESERVATION',
                status='UNREAD'
            ).order_by('-created_at')[:limit]
        )

    def mark_all_unread_as_read(self) -> None:
        ContactMessage.objects.filter(status='UNREAD').update(status='READ', is_read=True)

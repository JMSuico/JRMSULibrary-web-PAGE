# [Layer: Repositories/Implementations] — feedback_repository.py
# Feedback record persistence via Django ORM.
# Do NOT put business rules here — only data access operations.

from Features.Data.Models import Feedback
from Features.Repositories.Interfaces.feedback_repository_interface import FeedbackRepositoryInterface


class FeedbackRepository(FeedbackRepositoryInterface):

    def create(self, data: dict):
        return Feedback.objects.create(**data)

    def has_submitted_today(self, ip_address: str, user_agent: str) -> bool:
        from django.utils import timezone
        today = timezone.now().date()
        return Feedback.objects.filter(
            ip_address=ip_address,
            user_agent=user_agent,
            created_at__date=today
        ).exists()

    def get_all(self):
        return Feedback.objects.all().order_by('-created_at')

    def get_by_id(self, feedback_id: int):
        return Feedback.objects.get(pk=feedback_id)

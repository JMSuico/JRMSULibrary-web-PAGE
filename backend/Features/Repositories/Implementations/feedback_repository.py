# [Layer: Repositories/Implementations] — feedback_repository.py
# Feedback record persistence via Django ORM.
# Do NOT put business rules here — only data access operations.

from Features.Data.Models import Feedback
from Features.Repositories.Interfaces.feedback_repository_interface import FeedbackRepositoryInterface


class FeedbackRepository(FeedbackRepositoryInterface):

    def create(self, data: dict):
        return Feedback.objects.create(**data)

    def get_all(self):
        return Feedback.objects.all().order_by('-created_at')

    def get_by_id(self, feedback_id: int):
        return Feedback.objects.get(pk=feedback_id)

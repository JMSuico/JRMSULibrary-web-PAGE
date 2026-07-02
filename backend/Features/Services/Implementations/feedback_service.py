# [Layer: Services/Implementations] — feedback_service.py
# Handles feedback submission rules and dedup logic.
# Do NOT query database directly — use FeedbackRepository only.

from Features.Repositories.Implementations.feedback_repository import FeedbackRepository
from Features.Helpers.input_sanitizer import sanitize_input
from Features.Services.Interfaces.feedback_service_interface import FeedbackServiceInterface


class FeedbackService(FeedbackServiceInterface):

    def __init__(self):
        self.repository = FeedbackRepository()

    def submit_feedback(self, data: dict):
        sanitized = {
            'name': sanitize_input(data.get('name', '')),
            'email': sanitize_input(data.get('email', '')),
            'message': sanitize_input(data.get('message', '')),
            'category': data.get('category', ''),
            'rating': data.get('rating', 5),
        }
        return self.repository.create(sanitized)

    def get_all_feedback(self):
        return self.repository.get_all()

# [Layer: Services/Implementations] — feedback_service.py
# Handles feedback submission rules and dedup logic.
# Do NOT query database directly — use FeedbackRepository only.

from Features.Repositories.Implementations.feedback_repository import FeedbackRepository
from Features.Helpers.input_sanitizer import sanitize_input
from Features.Services.Interfaces.feedback_service_interface import FeedbackServiceInterface


class FeedbackService(FeedbackServiceInterface):

    def __init__(self):
        self.repository = FeedbackRepository()

    def submit_feedback(self, data: dict, ip_address: str = None, user_agent: str = None):
        # =====================================================================
        # [RATE LIMIT - 3 TIMES PER DAY]
        # This block checks if the same IP + User-Agent combo has already
        # submitted 3 ratings today. If yes, it raises a Throttled exception
        # and blocks the submission.
        # =====================================================================
        if ip_address and user_agent:
            if self.repository.get_today_submission_count(ip_address, user_agent) >= 3:
                from rest_framework.exceptions import Throttled
                raise Throttled(detail="You have already submitted the maximum ratings for today. Please try again tomorrow.")


        sanitized = {
            'name': sanitize_input(data.get('name', '')),
            'email': sanitize_input(data.get('email', '')),
            'message': sanitize_input(data.get('message', '')),
            'category': data.get('category', ''),
            'rating': data.get('rating', 5),
            'ip_address': ip_address,
            'user_agent': user_agent,
        }
        return self.repository.create(sanitized)

    def get_all_feedback(self):
        return self.repository.get_all()

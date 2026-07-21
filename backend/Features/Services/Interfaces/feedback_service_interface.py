# [Layer: Services/Interfaces] — feedback_service_interface.py
# Contract for feedback workflow.
# Do NOT put DB queries or HTTP concerns here.

from abc import ABC, abstractmethod


class FeedbackServiceInterface(ABC):

    @abstractmethod
    def submit_feedback(self, data: dict):
        """Validate and persist feedback submission."""
        pass

    @abstractmethod
    def get_all_feedback(self):
        """Retrieve all feedback records."""
        pass

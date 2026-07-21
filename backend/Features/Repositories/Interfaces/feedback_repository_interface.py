# [Layer: Repositories/Interfaces] — feedback_repository_interface.py
# Contract for feedback data access.
# Do NOT put business rules here — interfaces define what, not how.

from abc import ABC, abstractmethod


class FeedbackRepositoryInterface(ABC):

    @abstractmethod
    def create(self, data: dict):
        """Persist a new feedback submission."""
        pass

    @abstractmethod
    def get_all(self):
        """Retrieve all feedback records."""
        pass

    @abstractmethod
    def get_by_id(self, feedback_id: int):
        """Retrieve a single feedback by ID."""
        pass

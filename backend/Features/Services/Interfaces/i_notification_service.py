# [Layer: Services/Interfaces] — i_notification_service.py
# Abstract contract for notification business logic.
# Only defines contracts. No DB access. No HTTP concerns.

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class INotificationService(ABC):

    @abstractmethod
    def get_all_notifications(self) -> Dict[str, Any]:
        """
        Aggregate and return all notifications from system data.
        Returns a dict with keys: notifications, unread_count, total_visits.
        """
        pass

    @abstractmethod
    def mark_all_read(self) -> None:
        """
        Mark all unread notifications as read.
        """
        pass

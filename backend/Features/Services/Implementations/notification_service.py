# [Layer: Services/Implementations] — notification_service.py
# Business logic for aggregating notifications from system data.
# Calls Repository for data. Calls Helper for formatting. No ORM queries here.

from typing import Dict, Any, List
from Features.Services.Interfaces.i_notification_service import INotificationService
from Features.Repositories.Interfaces.i_notification_repository import INotificationRepository
from Features.Helpers.notification_helper import time_ago


# Milestone thresholds for visitor notifications
VISITOR_MILESTONES = [100, 300, 500, 800, 1000, 1300, 1500, 1800, 2000, 2500, 3000, 5000, 10000]


class NotificationService(INotificationService):
    """Aggregates notifications from multiple data sources via repositories."""

    def __init__(self, repo: INotificationRepository):
        self._repo = repo

    def get_all_notifications(self) -> Dict[str, Any]:
        notifications: List[Dict[str, Any]] = []
        nid = 1

        # -------------------------------------------------------------------
        # 1. Visitor milestone — highest reached
        # -------------------------------------------------------------------
        total_visits = self._repo.get_total_visit_count()
        highest_milestone = max(
            (m for m in VISITOR_MILESTONES if total_visits >= m),
            default=None,
        )
        if highest_milestone:
            notifications.append({
                'id': nid,
                'type': 'VISITOR_MILESTONE',
                'icon': 'users',
                'color': 'green',
                'title': f'Milestone Reached: {highest_milestone:,} Visitors!',
                'body': f'Your site has now received {total_visits:,} total visits.',
                'time': None,
                'time_ago': '',
                'read': True,
            })
            nid += 1

        # Next milestone progress
        next_milestone = next(
            (m for m in VISITOR_MILESTONES if total_visits < m), None
        )
        if next_milestone:
            remaining = next_milestone - total_visits
            notifications.append({
                'id': nid,
                'type': 'VISITOR_PROGRESS',
                'icon': 'trending-up',
                'color': 'blue',
                'title': f'Next Milestone: {next_milestone:,} Visitors',
                'body': f'{remaining:,} more visits needed to reach the next milestone.',
                'time': None,
                'time_ago': '',
                'read': True,
            })
            nid += 1

        # -------------------------------------------------------------------
        # 2. Unread email messages
        # -------------------------------------------------------------------
        for msg in self._repo.get_unread_emails(limit=5):
            notifications.append({
                'id': nid,
                'type': 'NEW_EMAIL',
                'icon': 'mail',
                'color': 'amber',
                'title': 'New Email Received',
                'body': f'From: {msg.name} \u2014 \u201c{msg.subject or "No Subject"}\u201d',
                'time': msg.created_at.isoformat(),
                'time_ago': time_ago(msg.created_at),
                'read': False,
            })
            nid += 1

        # -------------------------------------------------------------------
        # 3. Replied emails (successfully sent)
        # -------------------------------------------------------------------
        for msg in self._repo.get_replied_emails(limit=5):
            notifications.append({
                'id': nid,
                'type': 'REPLY_SENT',
                'icon': 'send',
                'color': 'indigo',
                'title': 'Reply Successfully Sent',
                'body': f'Reply sent to {msg.name} ({msg.email})',
                'time': msg.created_at.isoformat(),
                'time_ago': time_ago(msg.created_at),
                'read': True,
            })
            nid += 1

        # -------------------------------------------------------------------
        # 4. Unread reservations
        # -------------------------------------------------------------------
        for msg in self._repo.get_unread_reservations(limit=3):
            notifications.append({
                'id': nid,
                'type': 'NEW_RESERVATION',
                'icon': 'calendar',
                'color': 'purple',
                'title': 'New Reservation Request',
                'body': f'From: {msg.name} \u2014 {msg.subject or "Room Request"}',
                'time': msg.created_at.isoformat(),
                'time_ago': time_ago(msg.created_at),
                'read': False,
            })
            nid += 1

        # -------------------------------------------------------------------
        # 5. Unread credential requests
        # -------------------------------------------------------------------
        for msg in self._repo.get_unread_credential_requests(limit=3):
            notifications.append({
                'id': nid,
                'type': 'CREDENTIAL_REQUEST',
                'icon': 'key',
                'color': 'purple',
                'title': 'New Credential Request',
                'body': f'From: {msg.name} \u2014 {msg.subject or "Credential Request"}',
                'time': msg.created_at.isoformat(),
                'time_ago': time_ago(msg.created_at),
                'read': False,
            })
            nid += 1

        # Calculate exact total unread count from the DB, not just the visible limited notifications
        unread_count = self._repo.get_total_unread_count()

        return {
            'notifications': notifications,
            'unread_count': unread_count,
            'total_visits': total_visits,
        }

    def mark_all_read(self) -> None:
        self._repo.mark_all_unread_as_read()

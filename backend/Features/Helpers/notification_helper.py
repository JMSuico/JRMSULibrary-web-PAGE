# [Layer: Helpers] — notification_helper.py
# Pure utility functions for notification formatting.
# No business logic. No DB access. Helpers only.

from django.utils import timezone


def time_ago(dt) -> str:
    """Human-readable relative time string from a datetime object."""
    if dt is None:
        return ''
    now = timezone.now()
    delta = now - dt
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return 'Just now'
    elif seconds < 3600:
        mins = seconds // 60
        return f'{mins} min{"s" if mins > 1 else ""} ago'
    elif seconds < 86400:
        hours = seconds // 3600
        return f'{hours} hour{"s" if hours > 1 else ""} ago'
    else:
        days = delta.days
        return f'{days} day{"s" if days > 1 else ""} ago'

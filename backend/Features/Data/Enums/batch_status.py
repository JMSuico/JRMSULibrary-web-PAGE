# [Layer: Data/Enums] — batch_status.py
# Enum: open, closed, archived — batch lifecycle statuses

from django.db import models

class BatchStatus(models.TextChoices):
    OPEN = 'open', 'Open'
    CLOSED = 'closed', 'Closed'
    ARCHIVED = 'archived', 'Archived'

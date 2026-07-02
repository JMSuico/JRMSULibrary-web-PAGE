# [Layer: Data/Enums] — inquiry_status.py
# Enum: new, read, replied — contact message state.
# Do NOT put logic or computation here.

from django.db import models


class InquiryStatus(models.TextChoices):
    NEW = 'new', 'New'
    READ = 'read', 'Read'
    REPLIED = 'replied', 'Replied'

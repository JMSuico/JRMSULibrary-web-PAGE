# [Layer: Data/Models] — acquisition_batch_model.py
# Entity for batch-based book acquisitions

from django.db import models
from django.conf import settings
from Features.Data.Enums.batch_status import BatchStatus

class AcquisitionBatch(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=BatchStatus.choices, default=BatchStatus.OPEN)
    is_display_batch = models.BooleanField(default=False)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    safety_expiry = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_batches')
    remarks = models.TextField(blank=True)
    last_interacted_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_interacted_at', '-opened_at']

    def __str__(self):
        return self.name

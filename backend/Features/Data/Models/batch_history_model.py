# [Layer: Data/Models] — batch_history_model.py
# Audit trail for batch actions

from django.db import models
from django.conf import settings

class BatchHistory(models.Model):
    batch = models.ForeignKey('AcquisitionBatch', on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=100) # e.g. "Opened", "Closed", "Book Added"
    details = models.TextField(blank=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} on {self.batch.name} at {self.timestamp}"

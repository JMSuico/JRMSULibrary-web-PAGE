# [Layer: Models] — generated_report_model.py

from django.db import models
from .account_model import Account

class GeneratedReport(models.Model):
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=50)
    date_range = models.CharField(max_length=50)
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)
    report_data = models.JSONField()

    class Meta:
        db_table = 'jrmsu_generated_reports'
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.title} ({self.generated_at.strftime('%Y-%m-%d %H:%M')})"

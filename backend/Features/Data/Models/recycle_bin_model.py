# [Layer: Data/Models] — recycle_bin_model.py
from django.db import models
from django.utils import timezone

class RecycleBin(models.Model):
    MODULE_CHOICES = (
        ('BOOKS', 'Newly Acquired Books'),
        ('GALLERY', 'Library Sections'),
        ('BATCH', 'Acquisition Batches'),
        ('CMS_CONTENT', 'Content Manager (Pages)'),
        ('CMS_IMAGE', 'Content Manager (Images)'),
        ('CMS_LINK', 'Content Manager (Links)'),
        ('CMS_FILE', 'Content Manager (Files)'),
        ('ERESOURCE_DEPT', 'E-Resources (Departments)'),
        ('ERESOURCE_FILE', 'E-Resources (Files)'),
        ('CONTACT_MSG', 'Contact Messages'),
        ('REPORT', 'Generated Reports'),
        ('RESEARCH_REF', 'Research References'),
    )

    original_id = models.IntegerField()
    source_module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    item_name = models.CharField(max_length=300)
    data_snapshot = models.JSONField(help_text="Serialized data of the deleted item for restoration")
    deleted_at = models.DateTimeField(default=timezone.now)
    deleted_by = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-deleted_at']
        indexes = [
            models.Index(fields=['source_module']),
            models.Index(fields=['deleted_at']),
        ]

    def __str__(self):
        return f"{self.item_name} ({self.source_module}) deleted at {self.deleted_at}"

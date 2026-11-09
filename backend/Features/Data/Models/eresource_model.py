# [Layer: Data/Models] — eresource_model.py
from django.db import models


class EResourceDepartment(models.Model):
    name = models.CharField(max_length=200)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True, related_name='children'
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class EResourceFile(models.Model):
    OCR_STATUS_CHOICES = [
        ('pending', 'Pending Extraction'),
        ('completed', 'Knowledge Extracted'),
        ('failed', 'Extraction Failed'),
        ('skipped', 'Unsupported Format'),
    ]

    department = models.ForeignKey(
        EResourceDepartment, on_delete=models.CASCADE,
        related_name='files'
    )
    name = models.CharField(max_length=500)
    file = models.FileField(upload_to='e_resources/', max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    # Document Knowledge & OCR Extraction Fields
    extracted_text = models.TextField(blank=True, null=True, help_text="Parsed plain text from the document.")
    summary = models.TextField(blank=True, null=True, help_text="Executive summary of the document.")
    table_of_contents = models.TextField(blank=True, null=True, help_text="Extracted chapters and section headings.")
    keywords = models.TextField(blank=True, null=True, help_text="Extracted key subject matter terms and topics.")
    ocr_status = models.CharField(
        max_length=20,
        default='pending',
        choices=OCR_STATUS_CHOICES
    )
    ocr_processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

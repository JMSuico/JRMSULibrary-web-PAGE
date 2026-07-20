# [Layer: Data/Models] — contact_attachment_model.py
from django.db import models
from .contact_message_model import ContactMessage
import os
import uuid

def contact_attachment_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('contact_attachments', str(instance.contact_message.id), filename)

class ContactAttachment(models.Model):
    contact_message = models.ForeignKey(ContactMessage, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=contact_attachment_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="Size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Attachment {self.original_filename} for Message #{self.contact_message.id}"

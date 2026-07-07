# [Layer: Data/Models] — managed_file_model.py
from django.db import models


class ManagedFile(models.Model):
    category = models.CharField(max_length=100, help_text="Category (e.g., 'administration-manual')")
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to='managed_files/')
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"[{self.category}] {self.name}"

# [Layer: Data/Models] — page_content_model.py
from django.db import models


class PageContent(models.Model):
    slug = models.SlugField(max_length=100, unique=True, help_text="Unique identifier (e.g., 'history', 'quality-objectives')")
    title = models.CharField(max_length=200, help_text="Display title for the section")
    content = models.TextField(help_text="The actual text content")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['slug']

    def __str__(self):
        return f"{self.title} ({self.slug})"

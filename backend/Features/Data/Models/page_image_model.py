# [Layer: Data/Models] — page_image_model.py
from django.db import models


class PageImage(models.Model):
    section_key = models.CharField(max_length=100, help_text="Where this image belongs (e.g., 'home-hero', 'excellence')")
    image = models.ImageField(upload_to='page_images/')
    caption = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['section_key', 'order']

    def __str__(self):
        return f"{self.section_key} - Image {self.id}"

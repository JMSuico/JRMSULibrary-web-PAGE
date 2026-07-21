# [Layer: Data/Models] — managed_link_model.py
from django.db import models


class ManagedLink(models.Model):
    category = models.CharField(max_length=100, help_text="Category (e.g., 'open-access', 'social', 'uopac')")
    name = models.CharField(max_length=200)
    url = models.URLField(max_length=500)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return f"[{self.category}] {self.name}"

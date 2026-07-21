# [Layer: Data/Models] — site_visit_model.py
from django.db import models


class SiteVisit(models.Model):
    page = models.CharField(max_length=200, help_text="The path visited (e.g., '/', '/about')")
    visited_at = models.DateTimeField(auto_now_add=True)
    ip_hash = models.CharField(max_length=64, blank=True, help_text="Anonymized hash of visitor IP to distinguish uniques")

    class Meta:
        ordering = ['-visited_at']

    def __str__(self):
        return f"{self.page} visited on {self.visited_at.strftime('%Y-%m-%d %H:%M')}"

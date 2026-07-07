# [Layer: Data/Models] — feedback_model.py
from django.db import models


class Feedback(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    category = models.CharField(max_length=100)
    message = models.TextField()
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.category} - {self.created_at.strftime('%Y-%m-%d')}"

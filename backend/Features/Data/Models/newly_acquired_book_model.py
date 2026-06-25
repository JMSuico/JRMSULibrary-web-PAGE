from django.db import models


class NewlyAcquiredBook(models.Model):
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    author = models.CharField(max_length=200, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    cover_image = models.ImageField(upload_to='books/covers/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

# [Layer: Data/Models] — newly_acquired_book_model.py
from django.db import models


class NewlyAcquiredBook(models.Model):
    batch = models.ForeignKey('AcquisitionBatch', on_delete=models.CASCADE, related_name='books', null=True)
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200, blank=True)
    accession_number = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)
    cover_image = models.ImageField(upload_to='books/covers/', blank=True, null=True)
    date_encoded = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-date_encoded']

    def __str__(self):
        return self.title

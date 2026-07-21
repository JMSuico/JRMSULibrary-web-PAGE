# [Layer: Data/Models] — personnel_model.py
from django.db import models


class Personnel(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    photo = models.ImageField(upload_to='personnel/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Personnel'

    def __str__(self):
        return self.name

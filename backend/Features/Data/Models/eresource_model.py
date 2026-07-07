# [Layer: Data/Models] — eresource_model.py
from django.db import models


class EResourceDepartment(models.Model):
    name = models.CharField(max_length=200)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True, related_name='children'
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class EResourceFile(models.Model):
    department = models.ForeignKey(
        EResourceDepartment, on_delete=models.CASCADE,
        related_name='files'
    )
    name = models.CharField(max_length=500)
    file = models.FileField(upload_to='e_resources/', max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

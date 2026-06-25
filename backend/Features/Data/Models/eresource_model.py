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
    name = models.CharField(max_length=300)
    file = models.FileField(upload_to='e_resources/')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

from django.contrib.auth.models import AbstractUser
from django.db import models


class Account(AbstractUser):
    is_librarian = models.BooleanField(default=False)
    is_guest = models.BooleanField(default=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text='Profile picture for this admin user'
    )

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

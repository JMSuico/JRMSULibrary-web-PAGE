# [Layer: Data/Models] — account_model.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class Account(AbstractUser):
    is_librarian = models.BooleanField(default=False)
    is_guest = models.BooleanField(default=True)
    last_active = models.DateTimeField(null=True, blank=True)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text='Profile picture for this admin user'
    )
    is_terminal_created = models.BooleanField(
        default=False,
        help_text='Indicates if this admin was created via the terminal. Such admins cannot be deleted by UI-created admins.'
    )

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

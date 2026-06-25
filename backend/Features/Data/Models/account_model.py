from django.contrib.auth.models import AbstractUser
from django.db import models


class Account(AbstractUser):
    is_librarian = models.BooleanField(default=False)
    is_guest = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

# [Layer: Management/Commands] — update_database.py
# Wrapper for migrate. Use this instead of raw command.

from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Wrapper for migrate as per architecture rules.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Running migrate through architecture wrapper..."))
        call_command('migrate', *args, **options)
        self.stdout.write(self.style.SUCCESS("Database updated successfully."))

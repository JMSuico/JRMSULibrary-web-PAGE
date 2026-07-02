# [Layer: Management/Commands] — add_migration.py
# Wrapper for makemigrations. Use this instead of raw command.

from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Wrapper for makemigrations as per architecture rules.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Running makemigrations through architecture wrapper..."))
        call_command('makemigrations', *args, **options)
        self.stdout.write(self.style.SUCCESS("Migrations generated successfully."))

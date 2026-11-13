# [Layer: Management/Commands] — seed_local_books.py
"""
Django management command to seed all local books from eBooksTree.json
into the PostgreSQL database (EResourceFile) with AI domain knowledge.
"""

from django.core.management.base import BaseCommand
from Features.Helpers.local_books_auto_seeder import auto_seed_local_books_catalog


class Command(BaseCommand):
    help = "Seeds all TreeView local books into PostgreSQL with pre-extracted AI knowledge."

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force re-seeding even if files already exist in database.',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        self.stdout.write(self.style.NOTICE("Starting local books seeding (with PDF text extraction when available)..."))
        count = auto_seed_local_books_catalog(force=force, extract_pdfs_sync=True)
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded/updated {count} books."))

import os
import time
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Cleans up temporary attachment files older than 24 hours'

    def handle(self, *args, **options):
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_attachments')
        if not os.path.exists(temp_dir):
            self.stdout.write(self.style.SUCCESS("Temporary directory does not exist, nothing to clean."))
            return

        now = time.time()
        # 24 hours in seconds
        max_age = 24 * 60 * 60
        count = 0

        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            if os.path.isfile(file_path):
                # Get last modification time
                file_age = now - os.path.getmtime(file_path)
                if file_age > max_age:
                    try:
                        os.remove(file_path)
                        count += 1
                        self.stdout.write(f"Deleted old temp file: {filename}")
                    except Exception as e:
                        self.stderr.write(f"Failed to delete {filename}: {str(e)}")

        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {count} temporary files."))

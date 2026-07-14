# [Layer: management/commands] — seed_assets.py
import os
import shutil
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from Features.models import EResourceDepartment, EResourceFile, LibraryInteriorImage

class Command(BaseCommand):
    help = 'Seeds assets from frontend src directory into the database.'

    def handle(self, *args, **options):
        frontend_assets_dir = settings.BASE_DIR.parent / 'frontend' / 'src' / 'Assets' / 'assets'
        
        self.stdout.write("Starting asset seeding process...")
        
        # Seed eBooks
        ebooks_dir = frontend_assets_dir / 'eBooks' / 'eBooks'
        if ebooks_dir.exists():
            self.stdout.write(f"Seeding eBooks from {ebooks_dir}")
            self.seed_eresources(ebooks_dir)
        else:
            self.stdout.write(self.style.WARNING(f"Directory not found: {ebooks_dir}"))

        # Seed Physical Setups
        physical_dir = frontend_assets_dir / 'PHYSICAL SET-UP 2026'
        if physical_dir.exists():
            self.stdout.write(f"Seeding Physical Setup images from {physical_dir}")
            self.seed_library_images(physical_dir, section_label="Physical Setup")
        else:
            self.stdout.write(self.style.WARNING(f"Directory not found: {physical_dir}"))

        # Seed Library Pics
        library_pics_dir = frontend_assets_dir / 'Library pic converted'
        if library_pics_dir.exists():
            self.stdout.write(f"Seeding Library Pics from {library_pics_dir}")
            self.seed_library_images(library_pics_dir, section_label="Library Interior")
        else:
            self.stdout.write(self.style.WARNING(f"Directory not found: {library_pics_dir}"))

        self.stdout.write(self.style.SUCCESS("Asset seeding completed!"))

    def seed_eresources(self, base_dir, parent_dept=None):
        for item in base_dir.iterdir():
            if item.is_dir():
                # Create department
                dept, created = EResourceDepartment.objects.get_or_create(
                    name=item.name,
                    parent=parent_dept
                )
                if created:
                    self.stdout.write(f"  Created department: {dept.name}")
                self.seed_eresources(item, parent_dept=dept)
            elif item.is_file():
                # Skip hidden files
                if item.name.startswith('.'):
                    continue
                    
                if parent_dept is None:
                    parent_dept, _ = EResourceDepartment.objects.get_or_create(name="General eBooks")
                
                # Check if file already exists
                if EResourceFile.objects.filter(department=parent_dept, name=item.name).exists():
                    continue
                
                with item.open('rb') as f:
                    django_file = File(f, name=item.name)
                    EResourceFile.objects.create(
                        department=parent_dept,
                        name=item.name,
                        file=django_file
                    )
                self.stdout.write(f"  Added EResource: {item.name}")

    def seed_library_images(self, base_dir, section_label):
        for item in base_dir.iterdir():
            if item.is_file():
                if item.name.startswith('.'):
                    continue
                
                if LibraryInteriorImage.objects.filter(title=item.name).exists():
                    continue
                
                with item.open('rb') as f:
                    django_file = File(f, name=item.name)
                    LibraryInteriorImage.objects.create(
                        title=item.name,
                        section_label=section_label,
                        image=django_file
                    )
                self.stdout.write(f"  Added Library Image: {item.name}")

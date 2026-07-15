import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from Features.models import EResourceDepartment, EResourceFile, LibraryInteriorImage

# Supported file extensions for each import type
PDF_EXTENSIONS = {'.pdf'}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.jfif', '.webp', '.gif', '.bmp'}


class Command(BaseCommand):
    help = (
        'Imports eBooks and images from frontend assets into the media directory and database.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete ALL existing EResource records before importing (fresh start).',
        )

    def get_source_assets_dir(self):
        # In docker, it's mounted here
        docker_path = '/app/frontend_assets'
        if os.path.exists(docker_path):
            return docker_path
            
        # Locally, it's relative to the backend folder
        local_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'Assets', 'assets')
        return local_path

    def handle(self, *args, **options):
        if options['reset']:
            deleted_files = EResourceFile.objects.all().delete()
            deleted_depts = EResourceDepartment.objects.all().delete()
            self.stdout.write(self.style.WARNING(
                f"Reset complete: removed {deleted_files[0]} files and {deleted_depts[0]} departments."
            ))

        source_base = self.get_source_assets_dir()
        if not os.path.exists(source_base):
            self.stdout.write(self.style.ERROR(f"Source assets directory not found: {source_base}"))
            return

        # Ensure target media directories exist
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'e_resources', 'eBooks', 'Department'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'library_interiors'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'physical_setup'), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'newly_arrived_books'), exist_ok=True)

        # --- 1. Import eBooks from Department folder ---
        dept_source = os.path.join(source_base, 'eBooks', 'Department')
        dept_target = os.path.join(settings.MEDIA_ROOT, 'e_resources', 'eBooks', 'Department')
        if os.path.exists(dept_source):
            self.stdout.write(self.style.SUCCESS(f"Scanning eBooks: {dept_source}"))
            self._import_ebooks_folder(dept_source, dept_target, None)
        else:
            self.stdout.write(self.style.WARNING(
                f"eBooks Department directory not found at {dept_source}. Skipping eBook import."
            ))

        # --- 2. Import Library Interior images ---
        lib_source = os.path.join(source_base, 'Library pic converted')
        lib_target = os.path.join(settings.MEDIA_ROOT, 'library_interiors')
        if os.path.exists(lib_source):
            self.stdout.write(self.style.SUCCESS(f"Scanning Library Interior images: {lib_source}"))
            self._import_library_images(lib_source, lib_target)
        else:
            self.stdout.write(self.style.WARNING(
                f"Library interiors directory not found at {lib_source}. Skipping."
            ))

        # --- 3. Import Physical Setup images ---
        phys_source = os.path.join(source_base, 'PHYSICAL SET-UP 2026')
        phys_target = os.path.join(settings.MEDIA_ROOT, 'physical_setup')
        if os.path.exists(phys_source):
            self.stdout.write(self.style.SUCCESS(f"Scanning Physical Setup images: {phys_source}"))
            self._import_physical_setup(phys_source, phys_target)
        else:
            self.stdout.write(self.style.WARNING(
                f"Physical Setup directory not found at {phys_source}. Skipping."
            ))

        # --- 4. Import Newly Arrived Books ---
        new_source = os.path.join(source_base, 'NEWLY ARRIVED BOOKS')
        new_target = os.path.join(settings.MEDIA_ROOT, 'newly_arrived_books')
        if os.path.exists(new_source):
            self.stdout.write(self.style.SUCCESS(f"Scanning Newly Arrived Books images: {new_source}"))
            self._import_newly_arrived_books(new_source, new_target)
        else:
            self.stdout.write(self.style.WARNING(
                f"Newly Arrived Books directory not found at {new_source}. Skipping."
            ))

        self.stdout.write(self.style.SUCCESS("Import completed successfully!"))

    # ---------------------------------------------------------------
    # eBooks: recursive folder -> EResourceDepartment + EResourceFile
    # ---------------------------------------------------------------
    def _import_ebooks_folder(self, source_dir, target_dir, parent_department):
        try:
            items = sorted(os.listdir(source_dir))
        except PermissionError:
            self.stdout.write(self.style.WARNING(f"  Permission denied: {source_dir}"))
            return

        # Create target dir if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)

        for item in items:
            source_path = os.path.join(source_dir, item)
            target_path = os.path.join(target_dir, item)

            if os.path.isdir(source_path):
                dept, created = EResourceDepartment.objects.get_or_create(
                    name=item,
                    parent=parent_department,
                    defaults={'order': 0},
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"  + Department: {dept.name}"))
                self._import_ebooks_folder(source_path, target_path, dept)

            elif os.path.isfile(source_path):
                ext = os.path.splitext(item)[1].lower()
                if ext not in PDF_EXTENSIONS:
                    continue
                if not parent_department:
                    continue

                if not os.path.exists(target_path):
                    shutil.copy2(source_path, target_path)

                rel_path = os.path.relpath(target_path, settings.MEDIA_ROOT).replace('\\', '/')
                if not EResourceFile.objects.filter(file=rel_path).exists():
                    EResourceFile.objects.create(
                        department=parent_department,
                        name=os.path.splitext(item)[0],
                        file=rel_path,
                        is_active=True,
                    )
                    self.stdout.write(f"    + File: {item}")

    # ---------------------------------------------------------------
    # Library Interior images -> LibraryInteriorImage
    # ---------------------------------------------------------------
    def _import_library_images(self, source_dir, target_dir):
        count = 0
        for item in sorted(os.listdir(source_dir)):
            source_path = os.path.join(source_dir, item)
            target_path = os.path.join(target_dir, item)
            
            if not os.path.isfile(source_path):
                continue
            ext = os.path.splitext(item)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                continue

            if not os.path.exists(target_path):
                shutil.copy2(source_path, target_path)

            rel_path = os.path.relpath(target_path, settings.MEDIA_ROOT).replace('\\', '/')
            if not LibraryInteriorImage.objects.filter(image=rel_path).exists():
                title = os.path.splitext(item)[0].replace('_', ' ')
                LibraryInteriorImage.objects.create(
                    title=title,
                    image=rel_path,
                    section_label='Library Interior',
                    is_active=True,
                )
                count += 1
                self.stdout.write(f"    + Library Image: {item}")
        self.stdout.write(self.style.SUCCESS(f"  Imported {count} library interior images."))

    # ---------------------------------------------------------------
    # Physical Setup images -> LibraryInteriorImage (section_label='Physical Setup')
    # ---------------------------------------------------------------
    def _import_physical_setup(self, source_dir, target_dir):
        count = 0
        for item in sorted(os.listdir(source_dir)):
            source_path = os.path.join(source_dir, item)
            target_path = os.path.join(target_dir, item)
            
            if not os.path.isfile(source_path):
                continue
            ext = os.path.splitext(item)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                continue

            if not os.path.exists(target_path):
                shutil.copy2(source_path, target_path)

            rel_path = os.path.relpath(target_path, settings.MEDIA_ROOT).replace('\\', '/')
            if not LibraryInteriorImage.objects.filter(image=rel_path).exists():
                title = os.path.splitext(item)[0].replace('_', ' ')
                LibraryInteriorImage.objects.create(
                    title=title,
                    image=rel_path,
                    section_label='Physical Setup',
                    is_active=True,
                )
                count += 1
                self.stdout.write(f"    + Physical Setup Image: {item}")
        self.stdout.write(self.style.SUCCESS(f"  Imported {count} physical setup images."))

    # ---------------------------------------------------------------
    # Newly Arrived Books -> NewlyAcquiredBook (inside an AcquisitionBatch)
    # ---------------------------------------------------------------
    def _import_newly_arrived_books(self, source_dir, target_dir):
        from Features.Data.Models.acquisition_batch_model import AcquisitionBatch
        from Features.Data.Models.newly_acquired_book_model import NewlyAcquiredBook
        from datetime import datetime

        year = datetime.now().year
        batch_count = AcquisitionBatch.objects.filter(name__icontains=str(year)).count()
        batch_name = f"Batch {batch_count + 1} {year}"

        batch, created = AcquisitionBatch.objects.get_or_create(
            name=batch_name,
            defaults={
                'description': 'Automatically imported batch',
                'is_display_batch': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  + Created Batch: {batch.name}"))
            AcquisitionBatch.objects.exclude(id=batch.id).update(is_display_batch=False)

        count = 0
        for item in sorted(os.listdir(source_dir)):
            source_path = os.path.join(source_dir, item)
            target_path = os.path.join(target_dir, item)
            
            if not os.path.isfile(source_path):
                continue
            ext = os.path.splitext(item)[1].lower()
            if ext not in IMAGE_EXTENSIONS:
                continue

            if not os.path.exists(target_path):
                shutil.copy2(source_path, target_path)

            rel_path = os.path.relpath(target_path, settings.MEDIA_ROOT).replace('\\', '/')
            if not NewlyAcquiredBook.objects.filter(cover_image=rel_path).exists():
                title = os.path.splitext(item)[0].replace('_', ' ')
                NewlyAcquiredBook.objects.create(
                    batch=batch,
                    title=title,
                    cover_image=rel_path,
                    category='Imported'
                )
                count += 1
                self.stdout.write(f"    + Newly Acquired Books Image: {item}")
        self.stdout.write(self.style.SUCCESS(f"  Imported {count} newly arrived books into {batch_name}."))

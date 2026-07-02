import os
from django.core.files import File
from django.conf import settings
from django.db import migrations

def seed_assets(apps, schema_editor):
    EResourceDepartment = apps.get_model('Features', 'EResourceDepartment')
    EResourceFile = apps.get_model('Features', 'EResourceFile')

    # Calculate absolute path relative to the django base dir
    # settings.BASE_DIR is the backend directory.
    frontend_assets_dir = os.path.join(settings.BASE_DIR.parent, 'frontend', 'src', 'Assets', 'assets')
    ebooks_dir = os.path.join(frontend_assets_dir, 'eBooks', 'eBooks', 'Department')

    if not os.path.exists(ebooks_dir):
        print(f"\nSkipping eBook migration: Path does not exist -> {ebooks_dir}")
        return

    print("\nRunning automated data migration for eBooks and assets...")
    
    def migrate_folder(current_path, parent_dept=None, start_order=1):
        try:
            items = sorted(os.listdir(current_path))
        except Exception:
            return

        order_idx = start_order
        for item in items:
            item_path = os.path.join(current_path, item)
            
            if os.path.isdir(item_path):
                dept, _ = EResourceDepartment.objects.get_or_create(
                    name=item,
                    parent=parent_dept,
                    defaults={'order': order_idx}
                )
                migrate_folder(item_path, dept)
                order_idx += 1
                
            elif os.path.isfile(item_path):
                if parent_dept:
                    # Prevent duplicates
                    if not EResourceFile.objects.filter(department=parent_dept, name=item).exists():
                        try:
                            with open(item_path, 'rb') as f:
                                e_file = EResourceFile(
                                    department=parent_dept,
                                    name=item,
                                    is_active=True
                                )
                                e_file.file.save(item, File(f))
                                e_file.save()
                        except Exception as e:
                            print(f"Failed to save {item}: {e}")

    migrate_folder(ebooks_dir, None)
    print("Automated data migration complete.")

def unseed_assets(apps, schema_editor):
    # We won't strictly delete all files on reverse to avoid accidental data loss.
    pass

class Migration(migrations.Migration):

    dependencies = [
        ("Features", "0010_alter_eresourcefile_file_alter_eresourcefile_name"),
    ]

    operations = [
        migrations.RunPython(seed_assets, reverse_code=unseed_assets),
    ]


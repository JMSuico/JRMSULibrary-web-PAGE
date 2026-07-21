import os
import sys
import django
from django.core.files import File

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile

FRONTEND_EBOOKS_DIR = r"C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\frontend\src\Assets\assets\eBooks\eBooks\Department"

def clear_old_data():
    print("Clearing old E-Resources data...")
    EResourceDepartment.objects.all().delete()
    print("Old data cleared.")

def migrate_folder(current_path, parent_dept=None, start_order=1):
    items = sorted(os.listdir(current_path))
    order_idx = start_order
    
    for item in items:
        item_path = os.path.join(current_path, item)
        
        if os.path.isdir(item_path):
            # Create department
            dept, created = EResourceDepartment.objects.get_or_create(
                name=item,
                parent=parent_dept,
                defaults={'order': order_idx}
            )
            print(f"Created Department: {dept.name} under {parent_dept.name if parent_dept else 'Root'}")
            
            # Recurse into directory
            migrate_folder(item_path, dept)
            order_idx += 1
            
        elif os.path.isfile(item_path):
            # We don't attach files to the root. Only to valid departments.
            if parent_dept:
                # Check if file already exists in this department to prevent duplication
                if not EResourceFile.objects.filter(department=parent_dept, name=item).exists():
                    try:
                        with open(item_path, 'rb') as f:
                            e_file = EResourceFile(
                                department=parent_dept,
                                name=item,
                                is_active=True
                            )
                            # The Django ORM will automatically copy this to media/e_resources/
                            e_file.file.save(item, File(f))
                            e_file.save()
                        print(f"  + Uploaded File: {item} into {parent_dept.name}")
                    except Exception as e:
                        print(f"  ! Error uploading {item}: {str(e)}")
                else:
                    print(f"  ~ File already exists: {item} in {parent_dept.name}")

if __name__ == '__main__':
    print("Starting E-Resources full migration...")
    clear_old_data()
    if os.path.exists(FRONTEND_EBOOKS_DIR):
        migrate_folder(FRONTEND_EBOOKS_DIR, None)
        print("\nMigration completed successfully!")
    else:
        print(f"Directory not found: {FRONTEND_EBOOKS_DIR}")

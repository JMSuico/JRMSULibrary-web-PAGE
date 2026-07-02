import os
import shutil
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from Features.Data.Models.eresource_model import EResourceDepartment, EResourceFile

FRONTEND_DIR = r'C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\frontend\src\Assets\assets\eBooks\eBooks\Department'
MEDIA_DIR = r'C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\media\e_resources'

if not os.path.exists(MEDIA_DIR):
    os.makedirs(MEDIA_DIR)

def seed_files():
    for root, dirs, files in os.walk(FRONTEND_DIR):
        for file in files:
            if file.lower().endswith('.pdf'):
                # The folder name is the department name.
                # Since some folders have the same name (e.g. Research 1), we should ideally
                # find the department by traversing, but since folder names are mostly unique 
                # or we can just grab the first matching department:
                folder_name = os.path.basename(root)
                
                dept = EResourceDepartment.objects.filter(name=folder_name).first()
                if not dept:
                    print(f"Warning: Department '{folder_name}' not found for file '{file}'")
                    continue
                
                src_path = os.path.join(root, file)
                
                # To avoid filename collisions in media/e_resources, we could prefix with dept id or just use the filename
                # Django automatically handles filename collisions by appending a hash if needed,
                # but we'll copy it first.
                dest_filename = file
                dest_path = os.path.join(MEDIA_DIR, dest_filename)
                
                # Copy the file
                shutil.copy2(src_path, dest_path)
                
                # Create the DB record
                # Note: Django FileField expects a relative path to MEDIA_ROOT
                db_file_path = f"e_resources/{dest_filename}"
                
                EResourceFile.objects.get_or_create(
                    department=dept,
                    name=file.replace('.pdf', ''),
                    defaults={'file': db_file_path, 'is_active': True}
                )
                print(f"Seeded file: {file} into department: {folder_name}")

if __name__ == '__main__':
    seed_files()

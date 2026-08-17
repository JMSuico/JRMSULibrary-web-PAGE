import os
import re

base_path = r"C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE\backend\Features\Repositories\Implementations"

def replace_in_file(filepath, pattern, repl):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, repl, content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# batch_repository.py
replace_in_file(os.path.join(base_path, 'batch_repository.py'), 
                r'list\(AcquisitionBatch\.objects\.prefetch_related\(\'books\'\)\.all\(\)\)', 
                r"AcquisitionBatch.objects.prefetch_related('books').select_related('created_by').all()")
replace_in_file(os.path.join(base_path, 'batch_repository.py'), 
                r'list\(BatchHistory\.objects\.filter\(batch_id=batch_id\)\)', 
                r"BatchHistory.objects.select_related('batch', 'performed_by').filter(batch_id=batch_id)")

# eresource_repository.py
replace_in_file(os.path.join(base_path, 'eresource_repository.py'), 
                r'list\(EResourceDepartment\.objects\.all\(\)\)', 
                r"EResourceDepartment.objects.select_related('parent').all()")
replace_in_file(os.path.join(base_path, 'eresource_repository.py'), 
                r'list\(EResourceFile\.objects\.all\(\)\)', 
                r"EResourceFile.objects.select_related('department').all()")

# contact_repository.py
replace_in_file(os.path.join(base_path, 'contact_repository.py'), 
                r'ContactMessage\.objects\.all\(\)', 
                r"ContactMessage.objects.prefetch_related('attachments').all()")

# report_repository.py
replace_in_file(os.path.join(base_path, 'report_repository.py'), 
                r'list\(GeneratedReport\.objects\.filter\(archived=True\)\.order_by\(\'-created_at\'\)\)', 
                r"GeneratedReport.objects.select_related('generated_by').filter(archived=True).order_by('-created_at')")
replace_in_file(os.path.join(base_path, 'report_repository.py'), 
                r'GeneratedReport\.objects\.filter\(archived=False\)\.order_by\(\'-created_at\'\)', 
                r"GeneratedReport.objects.select_related('generated_by').filter(archived=False).order_by('-created_at')")

# General list removal
for file in os.listdir(base_path):
    if file.endswith('.py'):
        path = os.path.join(base_path, file)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace list(Model.objects...)
        new_content = re.sub(r'return list\((.*?\.objects\..*?)\)', r'return \1', content)
        # Replace return list(self...) in repositories that wrap methods
        new_content = re.sub(r'return list\((.*?)\)', r'return \1', new_content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed lists in {path}")

# Modifying Models
models_path = r"C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\JRMSULibrary-web-PAGE\backend\Features\Data\Models"
replace_in_file(os.path.join(models_path, 'newly_acquired_book_model.py'), 
                r"title = models\.CharField\(max_length=300\)", 
                r"title = models.CharField(max_length=300, db_index=True)")
replace_in_file(os.path.join(models_path, 'newly_acquired_book_model.py'), 
                r"accession_number = models\.CharField\(max_length=100, blank=True\)", 
                r"accession_number = models.CharField(max_length=100, blank=True, db_index=True)")
replace_in_file(os.path.join(models_path, 'newly_acquired_book_model.py'), 
                r"category = models\.CharField\(max_length=100, blank=True\)", 
                r"category = models.CharField(max_length=100, blank=True, db_index=True)")
replace_in_file(os.path.join(models_path, 'newly_acquired_book_model.py'), 
                r"date_encoded = models\.DateTimeField\(auto_now_add=True, null=True\)", 
                r"date_encoded = models.DateTimeField(auto_now_add=True, null=True, db_index=True)")

replace_in_file(os.path.join(models_path, 'research_reference_model.py'), 
                r"category = models\.CharField\(max_length=255, choices=CATEGORY_CHOICES\)", 
                r"category = models.CharField(max_length=255, choices=CATEGORY_CHOICES, db_index=True)")
replace_in_file(os.path.join(models_path, 'research_reference_model.py'), 
                r"acc_no = models\.CharField\(max_length=255, null=True, blank=True\)", 
                r"acc_no = models.CharField(max_length=255, null=True, blank=True, db_index=True)")
replace_in_file(os.path.join(models_path, 'research_reference_model.py'), 
                r"title = models\.CharField\(max_length=500\)", 
                r"title = models.CharField(max_length=500, db_index=True)")
replace_in_file(os.path.join(models_path, 'research_reference_model.py'), 
                r"created_at = models\.DateTimeField\(default=timezone\.now\)", 
                r"created_at = models.DateTimeField(default=timezone.now, db_index=True)")

print("Done")

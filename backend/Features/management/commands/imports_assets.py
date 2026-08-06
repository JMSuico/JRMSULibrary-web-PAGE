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
        'Imports eBooks, images, and base assets from frontend assets into the media directory and database.'
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
        
        # Check if running in cloud (Render automatically sets RENDER=true)
        is_cloud = os.environ.get('RENDER') == 'true' or os.environ.get('ENVIRONMENT') == 'production'

        if is_cloud:
            self.stdout.write(self.style.WARNING(f"Cloud Environment Detected: Skipping 5GB eBooks migration to save space."))
        else:
            if os.path.exists(dept_source):
                self.stdout.write(self.style.SUCCESS(f"Local Environment: Scanning eBooks in {dept_source}"))
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
        
        if is_cloud:
            self.stdout.write(self.style.WARNING(f"Cloud Environment Detected: Skipping Newly Arrived Books migration."))
        else:
            if os.path.exists(new_source):
                self.stdout.write(self.style.SUCCESS(f"Local Environment: Scanning Newly Arrived Books in {new_source}"))
                self._import_newly_arrived_books(new_source, new_target)
            else:
                self.stdout.write(self.style.WARNING(
                    f"Newly Arrived Books directory not found at {new_source}. Skipping."
                ))

        # --- 5. Base Assets (Background, Org Structure, Personnel, Excellence) ---
        self.stdout.write(self.style.SUCCESS(f"Scanning base assets in: {source_base}"))
        self._import_background(source_base)
        self._import_org_structure(source_base)
        self._import_personnel(source_base)
        self._import_excellence(source_base)
        self._import_external_links()
        self._import_page_texts()

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

    # ---------------------------------------------------------------
    # Base Assets: Background, Org Structure, Personnel
    # ---------------------------------------------------------------
    def _import_background(self, source_base):
        from Features.Data.Models.site_settings_model import SiteSettings
        from django.core.files import File
        img_path = os.path.join(source_base, "JRMSU library lib.jpg")
        if not os.path.exists(img_path):
            self.stdout.write(self.style.WARNING(f"    Background image not found: {img_path}"))
            return
        site_settings, created = SiteSettings.objects.get_or_create(id=1)
        if site_settings.background_image:
            self.stdout.write("    Background image already seeded. Skipping.")
            return
        with open(img_path, 'rb') as f:
            site_settings.background_image.save("JRMSU_library_lib.jpg", File(f), save=True)
        self.stdout.write(self.style.SUCCESS("    + Background migrated successfully!"))

    def _import_org_structure(self, source_base):
        from Features.Data.Models.managed_file_model import ManagedFile
        from django.core.files import File
        img_path = os.path.join(source_base, "organizational structure library.png")
        if not os.path.exists(img_path):
            self.stdout.write(self.style.WARNING(f"    Org structure image not found: {img_path}"))
            return
        if ManagedFile.objects.filter(category='OrgStructure').exists():
            self.stdout.write("    Org structure already seeded. Skipping.")
            return
        with open(img_path, 'rb') as f:
            mf = ManagedFile(category='OrgStructure', name='Organizational Structure', is_active=True)
            mf.file.save("organizational_structure_library.png", File(f), save=True)
        self.stdout.write(self.style.SUCCESS("    + Org structure migrated successfully!"))

    def _import_personnel(self, source_base):
        from Features.Data.Models.personnel_model import Personnel
        from django.core.files import File
        
        # 1. Chief Librarian (Maam Kiara)
        img_path = os.path.join(source_base, "maam kiaras.png")
        kiara = Personnel.objects.filter(name__icontains="Kiara").first()
        if not kiara:
            kiara = Personnel(
                name="Kiara Keren M. Alavanza",
                title="Campus Librarian",
                order=1
            )
            if os.path.exists(img_path):
                with open(img_path, 'rb') as f:
                    kiara.photo.save("maam_kiaras.png", File(f), save=True)
                self.stdout.write(self.style.SUCCESS("    + Personnel (Maam Kiara) migrated successfully!"))
            else:
                kiara.save()
                self.stdout.write(self.style.WARNING(f"    Personnel image not found: {img_path}. Saved Kiara without photo."))

        # 2. Staff Members
        staff_data = [
            {"name": "Marquita P. Morata", "title": "Staff, Library", "order": 2},
            {"name": "Bernie Rey L. Palon", "title": "Staff, Library", "order": 3},
            {"name": "Reizel C. Rosauro", "title": "Staff, Library", "order": 4},
        ]
        
        for staff in staff_data:
            person, created = Personnel.objects.get_or_create(
                name=staff["name"],
                defaults={
                    "title": staff["title"],
                    "order": staff["order"]
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"    + Personnel ({staff['name']}) seeded successfully!"))

    def _import_excellence(self, source_base):
        """Seeds the Excellence in Information image into ManagedFile (category='Excellence')."""
        from Features.Data.Models.managed_file_model import ManagedFile
        from django.core.files import File
        img_path = os.path.join(source_base, "JRMSU library lib.jpg")
        if not os.path.exists(img_path):
            self.stdout.write(self.style.WARNING(f"    Excellence image not found: {img_path}"))
            return
        if ManagedFile.objects.filter(category='Excellence').exists():
            self.stdout.write("    Excellence image already seeded. Skipping.")
            return
        with open(img_path, 'rb') as f:
            mf = ManagedFile(category='Excellence', name='Excellence in Information', is_active=True)
            mf.file.save("JRMSU_library_lib.jpg", File(f), save=True)
        self.stdout.write(self.style.SUCCESS("    + Excellence in Information image migrated successfully!"))

    def _import_external_links(self):
        from Features.Data.Models.managed_link_model import ManagedLink
        
        default_links = [
            # Open Access Journals
            { 'name': 'Agriculture', 'url': 'https://www.mdpi.com/journal/agriculture', 'category': 'Open Access Journals' },
            { 'name': 'List of Scientific Journals', 'url': 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'category': 'Open Access Journals' },
            { 'name': 'List of Academic Journal', 'url': 'https://en.wikipedia.org/wiki/Lists_of_academic_journals', 'category': 'Open Access Journals' },
            { 'name': 'Worldcat', 'url': 'https://search.worldcat.org/', 'category': 'Open Access Journals' },
            { 'name': 'Google Books', 'url': 'https://books.google.com/?hl=en', 'category': 'Open Access Journals' },
            { 'name': 'Online Free E-Books', 'url': 'https://www.free-ebooks.net/', 'category': 'Open Access Journals' },
            { 'name': 'Gutenberg', 'url': 'https://www.gutenberg.org/', 'category': 'Open Access Journals' },
            { 'name': 'Scribd', 'url': 'https://www.scribd.com/', 'category': 'Open Access Journals' },
            { 'name': 'GetFreeEbooks', 'url': 'https://getfreeebooks.com/', 'category': 'Open Access Journals' },
            { 'name': 'DOST Publication', 'url': 'https://www.dost.gov.ph/index.php?option=com_content&task=view&id=712&Itemid=201', 'category': 'Open Access Journals' },
            { 'name': 'Highwire Press', 'url': 'https://www.highwirepress.com/', 'category': 'Open Access Journals' },
            { 'name': 'IPL Magazines', 'url': 'https://www.ipl.org/', 'category': 'Open Access Journals' },
            
            # Resources
            { 'name': 'Science Direct', 'url': 'https://www.sciencedirect.com/', 'category': 'Resources' },
            { 'name': 'Philippine Elib', 'url': 'https://www.elib.gov.ph/', 'category': 'Resources' },
            { 'name': 'ERIC Education Research', 'url': 'https://eric.ed.gov/', 'category': 'Resources' },
            { 'name': 'Gale Database', 'url': 'https://link.gale.com/apps/menu?userGroupName=phusm&prodId=MENU', 'category': 'Resources' },
            { 'name': 'Philippine E-Journals', 'url': 'https://ejournals.ph/', 'category': 'Resources' },
            { 'name': 'Springer Nature Link', 'url': 'https://link.springer.com/', 'category': 'Resources' },
            { 'name': 'E-Library USA', 'url': 'https://docs.google.com/forms/d/e/1FAIpQLSdK93TrYAkWrl32xWxlOItfYFTTgUQPY_Ws2ZhxfuVMvojpiA/viewform', 'category': 'Resources' },
            { 'name': 'ProQuest', 'url': 'https://www.proquest.com/', 'category': 'Resources' },
            { 'name': 'Student Handbooks', 'url': 'https://drive.google.com/file/d/18erQ6LSfT3Jia84n77WBPOb1JfzI-tQj/view', 'category': 'Resources' },
            
            # Acquired E-Resources
            { 'name': 'Bookshelf (VitalSource)', 'url': 'https://www.vitalsource.com/', 'category': 'Acquired E-Resources' },
            { 'name': 'Scholaar', 'url': 'https://scholaar.com/', 'category': 'Acquired E-Resources' },
        ]

        if ManagedLink.objects.exists():
            self.stdout.write("    External Links already seeded. Skipping.")
            return

        for link_data in default_links:
            ManagedLink.objects.create(
                name=link_data['name'],
                url=link_data['url'],
                category=link_data['category'],
                is_active=True
            )
        self.stdout.write(self.style.SUCCESS(f"    + {len(default_links)} External Links migrated successfully!"))

    def _import_page_texts(self):
        from Features.Data.Models.page_content_model import PageContent
        
        defaults = [
            {
                'slug': 'about_history',
                'title': 'History of JRMSU Katipunan Campus',
                'content': '<p>Jose Rizal Memorial State University was established by virtue of RA 9852 with Congresswoman Cecilia G. Jalosjos-Carreon as principal author, Congressman Cesar Jalosjos as co-author. It was approved by President Gloria Macapagal-Arroyo on December 15, 2009. It was formerly the Jose Rizal Memorial State College by virtue of RA 8193 sponsored by Congressman Romeo G. Jalosjos of the 1st District of Zamboanga del Norte which was approved on June 11, 1996 by the President of the Republic, Fidel V. Ramos. It was a consolidation of the Rizal Memorial Vocational School (RMNVS) in Dapitan City, the Zamboanga del Norte School of Arts and Trades (ZNSAT) in Dipolog City, and the Siocon National Vocational School (SNVS) in the Municipality of Siocon. In 2002, two higher education institutions (HEIs) within Zamboanga del Norte, namely the Katipunan National Agricultural School (KNAS) in the municipality of Katipunan and the Zamboanga del Norte Agricultural College (ZNAC) in the Municipality of Tampilisan, were integrated into then JRMSC pursuant to CHED Memorandum Order No. 27 series of 2000 thus comprising the fourth and fifth campuses, respectively of JRMSU.</p><p>The first President was Dr. Felipe O. Ligan who was appointed in 1997. On June 7, 2002 CHED Special Order No. 35, s. 2002 appointed Dr. Henry A. Sojor as the OIC President of the Jose Rizal Memorial State College in concurrent capacity as President of Central Visayas Polytechnic College in Dumaguete City now Negros Oriental State University.</p><p>In the span of two years and eight months, the Board of Trustee then deemed it best for the College to have its permanent leader. Thus, on March 1, 2005, Dr. Edgar S. Balbuena assumed office as second President of JRMSC pursuant to BOT Resolution No. 04, series of 2005 Chairmaned by Fr. Rolando V. Rosa, OP.</p><p>With the appointment of Dr. Balbuena, the College charted a new course. With his extraordinary leadership it took only four years and nine months for the College to be elevated to the status of a University. Indeed the growth of the University means a continuing and growing commitment for academic excellence and quality, research, and productivity, community involvement and partnership for national development and global competitiveness. Evidently, he emerged as a dynamo, leading the people of Zamboanga del Norte and adjacent provinces towards improved quality life.</p>'
            },
            {
                'slug': 'about_quality',
                'title': 'JRMSU Library Quality Objectives',
                'content': '<ul><li>Increase the acquisition of print, digital, and multimedia resources by 10% annually to ensure modern, relevant, and accessible materials that support instruction, research, extension, and production.</li><li>Increase library user engagement by 10% and ensure the 100% provision of adaptive, inclusive, and transformative library facilities that foster creativity, critical thinking, and lifelong learning.</li><li>Forge at least one (1) local and one (1) international formal partnership or collaboration each year, and implement at least one (1) joint program or activity with academic institutions, government agencies, or library networks to strengthen resource sharing, collaboration, and service innovation.</li><li>Ensure that 100% of library personnel participate in at least two (2) capacity-building or professional development activities per year, strengthening their skills in technology, research support, customer service, and library management.</li><li>Achieve a minimum of 90% overall user satisfaction rating in the annual library survey by continuously delivering equitable, technology-driven, and user-centered services.</li></ul>'
            },
            {
                'slug': 'our_services',
                'title': 'Our 17 Library Services',
                'content': '<p>Library User Education</p><p>Informal Reference Service</p><p>Readers Advisory Services</p><p>Technical Services</p><p>Audio-Visual Services</p><p>Circulation Services</p><p>Ask-a-Librarian / #AskRIZAL</p><p>Photo/Scan Me Service</p><p>OPAC Service</p><p>Printing Service</p><p>Property Counter Service</p><p>Selective Dissemination of Information</p><p>Current Awareness Services</p><p>Referral Information Service (RIS)</p><p>File Transfer Service</p><p>Internet / e-Library / Free Wi-Fi</p><p>Online Databases Service</p>'
            },
            {
                'slug': 'personnel_text',
                'title': 'Librarian\'s Corner Text',
                'content': '<p>From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence.</p><p>The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University\'s Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users.</p><p>Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!</p>'
            }
        ]

        if PageContent.objects.exists():
            self.stdout.write("    Page Texts already seeded. Skipping.")
            return

        for text_data in defaults:
            PageContent.objects.create(
                slug=text_data['slug'],
                title=text_data['title'],
                content=text_data['content']
            )
        self.stdout.write(self.style.SUCCESS(f"    + {len(defaults)} Page Texts migrated successfully!"))

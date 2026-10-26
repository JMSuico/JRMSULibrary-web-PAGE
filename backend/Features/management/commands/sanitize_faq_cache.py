import os
import re
import logging
from django.core.management.base import BaseCommand
from django.core.cache import cache
from Features.models import AIFaqCache

logger = logging.getLogger(__name__)

# Terms that indicate hallucinated or undesirable cache entries
PURGE_TERMS = [
    'braveheart',
    'shakespeare',
    'art of war',
    'sapiens',
    'alchemist',
    'no books yet',
    'hello rizal',
    'hello, rizal',
    'recommend a history book',
    'recommend a book',
    'no books',
    'can you recommend',
]

# Standard curated institutional FAQs from 0035 migration
CURATED_INSTITUTIONAL_FAQS = [
    "what are the library hours",
    "is the library open on weekends",
    "who can use the library",
    "how can i borrow a book",
    "how many books can i borrow",
    "can i renew a borrowed book",
    "what is the penalty for late returns",
    "what happens if i lose a book",
    "can i borrow magazines or newspapers",
    "where is the filipiniana section",
    "where are the it books",
    "where are the nursing books",
    "do you have thesis copies",
    "how do i access e-resources",
    "do i need internet to use e-resources",
    "is there free wifi in the library",
    "can i charge my laptop",
    "can i bring food inside",
    "can i bring my bag inside",
    "how do i access the main campus uopac",
    "how do i search in uopac",
    "what is uopac",
    "who is rizal",
    "who are you",
    "what is your name",
    "who created rizal",
    "can rizal write my essay",
    "do i need a library card",
    "what is the automated borrow and return process",
    "can i reserve a book online",
    "where can i read silently",
    "are group studies allowed",
    "can outsiders use the library",
    "how do i get a referral letter",
    "where is the cr",
    "can i use the library computers",
    "how long can i use the computer",
    "do you have a printer",
    "what is a clearance",
    "how do i get my clearance signed",
    "why wasn't my clearance signed",
    "can someone else return my book",
    "what if the book gets wet",
    "can i highlight a book",
    "how do i suggest a book",
    "who is the librarian",
    "how are books arranged",
    "what is 000 in ddc",
    "what is 100 in ddc",
    "what is 200 in ddc",
    "what is 300 in ddc",
    "what is 400 in ddc",
    "what is 500 in ddc",
    "what is 600 in ddc",
    "what is 700 in ddc",
    "what is 800 in ddc",
    "what is 900 in ddc",
    "how do i find a specific author",
    "what does ref mean on a book",
    "what does fil mean on a book",
    "do you have board exam reviewers",
    "where is the reserve section",
    "can i borrow reserve books overnight",
    "what if i return an overnight book late",
    "can i donate books",
    "do you have fiction books",
    "is there a dress code",
    "what should i do if the fire alarm rings",
    "can i take photos of the books",
    "how can i contact the library",
    "does the library have a facebook page",
    "do you offer library orientation",
    "what is a call number",
    "how do i read a call number",
    "can the ai find my book",
    "are there e-books available",
    "can i use my phone",
    "what is an automated library system",
    "why is automation better",
    "how secure is my data",
    "can i reset my password",
    "where can i give feedback",
    "do you have audio visual materials",
    "what is the periodicals section",
    "how often are new books added",
    "what is an isbn",
    "where is the library located",
    "can i do my project inside",
    "is sleeping allowed",
    "can i leave my things on the table",
    "how do i know if a book is available",
    "what is a bibliography",
    "can rizal help me with citations",
    "what is apa format",
    "what is mla format",
    "are there dictionaries in the library",
    "can i check my fines online",
    "why is the library important",
    "what makes this library system unique",
    "thank you",
    "hello",
    # Room reservation institutional entries
    "can i reserve a room",
    "how to reserve a room",
    "how do i reserve a room",
    # Database & Institutional Read/View and CMS entries
    "what tables can you read",
    "what data can you view",
    "what are the library services",
    "what is the organizational structure",
    "what is in the librarians corner",
]

# Standard accurate answers to enforce
STANDARD_FAQ_UPDATES = {
    'what are the library hours': [
        'The JRMSU Katipunan Campus Library is open from Monday to Friday, 7:00 AM to 7:00 PM (Philippine Time), with no noon break. Closed on weekends and regular holidays.'
    ],
    'can i reserve a room': [
        'To reserve Discussion Room 1 or 2, Tutorium Room 1 or 2, or the Multimedia Room, simply click the "Reserve a Room" button directly below this chat window. Fill in your name, email, and reservation schedule, and our library staff will review and approve your request!'
    ],
    'how to reserve a room': [
        'To reserve Discussion Room 1 or 2, Tutorium Room 1 or 2, or the Multimedia Room, simply click the "Reserve a Room" button directly below this chat window. Fill in your name, email, and reservation schedule, and our library staff will review and approve your request!'
    ],
    'how do i reserve a room': [
        'To reserve Discussion Room 1 or 2, Tutorium Room 1 or 2, or the Multimedia Room, simply click the "Reserve a Room" button directly below this chat window. Fill in your name, email, and reservation schedule, and our library staff will review and approve your request!'
    ],
    'how can i borrow a book': [
        'To borrow a book, present your valid JRMSU Student ID to the Katipunan Campus Circulation Desk. Students can borrow up to 3 books for 3 days; faculty can borrow up to 5 books for 1 week.'
    ],
    'who are you': [
        'I am Rizal, the AI Assistant for the Jose Rizal Memorial State University (JRMSU) Katipunan Campus Library! I am connected to our live library database to help you with Newly Acquired Books, Research & Thesis References, 60 E-Resource Department folders, 23 Online Databases, Physical Setup sections, Room Reservations, and Library Services.'
    ],
    'what is your name': [
        'I am Rizal, the AI Assistant for the Jose Rizal Memorial State University (JRMSU) Katipunan Campus Library! How can I help you today?'
    ],
    'who is rizal': [
        'I am Rizal, the AI Assistant for the Jose Rizal Memorial State University (JRMSU) Katipunan Campus Library, named in honor of Dr. Jose Rizal. I help students and faculty navigate our library catalog, E-Resources, facilities, and services!'
    ],
    'who is the librarian': [
        'Our JRMSU Katipunan Campus Library is headed by Campus Librarian Kiara Keren M. Alavanza, assisted by Library Staff Marquita P. Morata, Bernie Rey L. Palon, and Reizel C. Rosauro.'
    ],
    'do you have a printer': [
        'Yes! Printing Service and Scanning Service are among the 17 official library services available at the JRMSU Katipunan Campus Library. Please approach our library staff at the desk for assistance.'
    ],
    'what tables can you read': [
        'I have read-only access to the live JRMSU Katipunan Campus Library PostgreSQL tables: NewlyAcquiredBook & AcquisitionBatch (Newly Acquired Books & batches), ResearchReference (Research & Thesis References), EResourceDepartment & EResourceFile (60 academic department folders & PDF files), ManagedLink & ManagedFile (23 online databases & downloadable documents), LibraryInteriorImage (Physical Setup sections), Personnel (Library Personnel directory), PageContent & PageImage (Institutional CMS content, History, Quality Objectives, 17 Library Services, Librarian\'s Corner, and Organizational Structure chart), SiteSettings (operating hours & contact info), and AIFaqCache (curated institutional FAQs). Private administrative and user tables are strictly excluded.'
    ],
    'what data can you view': [
        'I can view and retrieve live public library data from our PostgreSQL database, including: (1) Newly Acquired Books & Acquisition Batches (135 book cover photos in Batch 1 2026 and named catalog books), (2) Research & Thesis References (titles, authors, call numbers, departments, and softcopy PDF/link availability), (3) E-Resources & Online Databases (60 academic department folders across CCS, CTED, CBA, AGRI, and BSABE/CAF, plus 23 active online databases like Bookshelf by VitalSource, Scholaar, Science Direct, Gale, and ProQuest), (4) Physical Setup & Facilities (37 mapped library sections and reservable rooms: Discussion Room 1 & 2, Tutorium Room 1 & 2, and Multimedia Room), and (5) Institutional CMS & Personnel Data (the 17 official Library Services, Campus History under RA 9852, Quality Objectives, Librarian\'s Corner, Organizational Structure led by Campus Librarian Kiara Keren M. Alavanza with Library Staff Marquita P. Morata, Bernie Rey L. Palon, and Reizel C. Rosauro, and Operating Hours: Monday to Friday, 7:00 AM - 7:00 PM).'
    ],
    'what are the library services': [
        'The JRMSU Katipunan Campus Library offers these 17 official Library Services:\n1. Library User Education\n2. Informal Reference Service\n3. Readers Advisory Services\n4. Technical Services\n5. Audio-Visual Services\n6. Circulation Services\n7. Ask-a-Librarian / #AskRIZAL\n8. Photo/Scan Me Service\n9. OPAC Service\n10. Printing Service\n11. Property Counter Service\n12. Selective Dissemination of Information\n13. Current Awareness Services\n14. Referral Information Service (RIS)\n15. File Transfer Service\n16. Internet / e-Library / Free Wi-Fi\n17. Online Databases Service'
    ],
    'what is the organizational structure': [
        'The JRMSU Katipunan Campus Library organizational structure is headed by Campus Librarian Kiara Keren M. Alavanza, assisted by Library Staff Marquita P. Morata, Bernie Rey L. Palon, and Reizel C. Rosauro. You can view the full visual Organizational Structure chart on the About page as well as the Library Personnel hierarchy section on our website.'
    ],
    'what is in the librarians corner': [
        'The Librarian\'s Corner features an inspiring message from Campus Librarian Kiara Keren M. Alavanza and the JRMSU Katipunan Campus Library team: "From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence." It highlights the library\'s commitment to supporting JRMSU\'s Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources, enhancing collections and technological services, promoting information literacy, and strengthening research support, closing with: "Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!"'
    ],
}


def normalize_text(text: str) -> str:
    """Lowercase and strip non-alphanumeric characters for robust comparison."""
    text = str(text or '').lower()
    return re.sub(r'[^a-z0-9\s]', '', text).strip()


class Command(BaseCommand):
    help = 'Sanitizes AIFaqCache in PostgreSQL and flushes Redis FAQ/Context cache keys.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run analysis and show what would be purged and updated without altering DB or Redis.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        prefix = "[DRY-RUN] " if dry_run else ""

        self.stdout.write(self.style.NOTICE(f"=== {prefix}Starting AIFaqCache Sanitization ==="))

        curated_normalized = {normalize_text(q) for q in CURATED_INSTITUTIONAL_FAQS}
        curated_raw = {q.strip().lower() for q in CURATED_INSTITUTIONAL_FAQS}

        # -------------------------------------------------------------
        # 1. PURGE INVALID / HALLUCINATED / NON-CURATED ROWS
        # -------------------------------------------------------------
        all_entries = list(AIFaqCache.objects.all())
        purged_records = []

        for entry in all_entries:
            q_raw = entry.question.strip().lower()
            q_norm = normalize_text(entry.question)

            matched_term = None
            # Check question against blacklist terms
            for term in PURGE_TERMS:
                if term in q_raw:
                    matched_term = f"Question contains '{term}'"
                    break

            # Check answers against blacklist terms
            if not matched_term:
                answers = entry.answers if isinstance(entry.answers, list) else [str(entry.answers)]
                for ans in answers:
                    ans_lower = str(ans).lower()
                    for term in PURGE_TERMS:
                        if term in ans_lower:
                            matched_term = f"Answer contains '{term}'"
                            break
                    if matched_term:
                        break

            # Check if part of standard curated institutional FAQs
            is_curated = (q_raw in curated_raw) or (q_norm in curated_normalized)

            if matched_term or not is_curated:
                reason = matched_term if matched_term else "Question is not part of standard curated institutional FAQs"
                purged_records.append((entry.id, entry.question, reason))
                if not dry_run:
                    entry.delete()

        self.stdout.write(self.style.WARNING(f"\n--- Purged Rows ({len(purged_records)}) ---"))
        for row_id, q_text, reason in purged_records:
            self.stdout.write(f"  [DELETED] ID {row_id}: \"{q_text}\" (Reason: {reason})")

        # -------------------------------------------------------------
        # 2. UPDATE STANDARD FAQ ENTRIES
        # -------------------------------------------------------------
        updated_records = []
        created_records = []

        for question, answers in STANDARD_FAQ_UPDATES.items():
            if not dry_run:
                obj, created = AIFaqCache.objects.update_or_create(
                    question=question,
                    defaults={'answers': answers}
                )
                if created:
                    created_records.append((obj.id, question))
                else:
                    updated_records.append((obj.id, question))
            else:
                existing = AIFaqCache.objects.filter(question=question).first()
                if existing:
                    updated_records.append((existing.id, question))
                else:
                    created_records.append((None, question))

        self.stdout.write(self.style.SUCCESS(f"\n--- Standard Entries Created ({len(created_records)}) ---"))
        for row_id, q_text in created_records:
            self.stdout.write(f"  [CREATED] ID {row_id or 'NEW'}: \"{q_text}\"")

        self.stdout.write(self.style.SUCCESS(f"\n--- Standard Entries Updated ({len(updated_records)}) ---"))
        for row_id, q_text in updated_records:
            self.stdout.write(f"  [UPDATED] ID {row_id}: \"{q_text}\"")

        # -------------------------------------------------------------
        # 3. FLUSH REDIS CACHE
        # -------------------------------------------------------------
        self.stdout.write(self.style.NOTICE(f"\n--- Flushing Redis FAQ & Context Caches ---"))
        flushed_django_keys = []
        flushed_direct_keys = []

        # (a) Django Cache API
        if not dry_run:
            try:
                cache.delete("rizal_institution_context")
                cache.delete("rizal_faq_dataset")
                flushed_django_keys.extend(["rizal_institution_context", "rizal_faq_dataset"])
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Django cache delete error: {e}"))

        # (b) Direct Redis connection for raw & pattern deletions
        redis_client = None
        try:
            if hasattr(cache, '_cache') and hasattr(cache._cache, 'get_client'):
                redis_client = cache._cache.get_client()
        except Exception:
            pass

        if not redis_client:
            try:
                import redis
                from django.conf import settings
                redis_url = getattr(settings, 'CACHES', {}).get('default', {}).get('LOCATION', '')
                if not redis_url:
                    redis_url = os.environ.get('REDIS_CACHE_URL', 'redis://redis:6379/1')
                redis_client = redis.from_url(redis_url)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Redis direct connection error: {e}"))

        if redis_client:
            try:
                # Target exact keys + pattern keys (both versioned and raw)
                patterns_to_scan = [
                    '*rizal_institution_context*',
                    '*rizal_faq_dataset*',
                    '*rizal_l1_faq:*',
                    'rizal_institution_context*',
                    'rizal_faq_dataset*',
                    'rizal_l1_faq:*',
                ]
                matched_raw_keys = set()
                for pattern in patterns_to_scan:
                    for k in redis_client.keys(pattern):
                        matched_raw_keys.add(k)

                if matched_raw_keys:
                    for k in matched_raw_keys:
                        k_str = k.decode('utf-8', errors='ignore') if isinstance(k, bytes) else str(k)
                        flushed_direct_keys.append(k_str)

                    if not dry_run:
                        redis_client.delete(*matched_raw_keys)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Redis direct flush error: {e}"))

        for k in flushed_direct_keys:
            self.stdout.write(f"  [REDIS FLUSHED] {k}")

        # Summary
        self.stdout.write(self.style.SUCCESS(f"\n=== {prefix}Sanitization Summary ==="))
        self.stdout.write(self.style.SUCCESS(f"Purged rows: {len(purged_records)}"))
        self.stdout.write(self.style.SUCCESS(f"Created rows: {len(created_records)}"))
        self.stdout.write(self.style.SUCCESS(f"Updated rows: {len(updated_records)}"))
        self.stdout.write(self.style.SUCCESS(f"Redis keys flushed: {len(flushed_direct_keys)} raw keys (plus Django cache keys)"))
        self.stdout.write(self.style.SUCCESS(f"Remaining AIFaqCache total: {AIFaqCache.objects.count()}"))

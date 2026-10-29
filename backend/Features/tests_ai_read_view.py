# [Layer: Tests] — tests_ai_read_view.py
"""
Comprehensive Verification Test Suite for the JRMSU Katipunan Campus Library AI Assistant
Deterministic Read/View & Weighted Relevance-Sorting Engine (13 Public Tables + 5 Algorithms).

Can be executed via:
  1. `python manage.py test Features.tests_ai_read_view`
  2. `python Features/tests_ai_read_view.py`
"""

import ast
import os
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

# Ensure backend root is on sys.path and Django is initialized when executed directly
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

import django  # noqa: E402

django.setup()

from django.test import TestCase  # noqa: E402
from Features.Data.Models import (  # noqa: E402
    AcquisitionBatch,
    AIFaqCache,
    EResourceDepartment,
    LibraryInteriorImage,
    ManagedFile,
    ManagedLink,
    NewlyAcquiredBook,
    PageContent,
    Personnel,
    SiteSettings,
)
from Features.Helpers.ai_read_view_helper import AIReadViewHelper  # noqa: E402
from Features.Services.Implementations.ai_service import AIService  # noqa: E402


RESTRICTED_MODEL_NAMES = {
    "Account",
    "ContactMessage",
    "ContactAttachment",
    "Feedback",
    "SiteVisit",
    "RecycleBin",
    "GeneratedReport",
    "BatchHistory",
}

CANONICAL_17_SERVICES = [
    "Library User Education",
    "Informal Reference Service",
    "Readers Advisory Services",
    "Technical Services",
    "Audio-Visual Services",
    "Circulation Services",
    "Ask-a-Librarian / #AskRIZAL",
    "Photo/Scan Me Service",
    "OPAC Service",
    "Printing Service",
    "Property Counter Service",
    "Selective Dissemination of Information",
    "Current Awareness Services",
    "Referral Information Service (RIS)",
    "File Transfer Service",
    "Internet / e-Library / Free Wi-Fi",
    "Online Databases Service",
]

CANONICAL_BSIS_COURSES = [
    "Data Structures an Algorithms",
    "Discrete Mathematics",
    "Enterprise Architecture",
    "Evaluation of Business Performance",
    "Financial Management",
    "Fundamentals of Information Systems",
    "Fundamentals of Programming",
    "Information Management",
    "Intermediate Programming",
    "Intro to 2D Animation",
    "Introduction to Computing",
    "IT Infrastructure & Network Techonologies",
    "Mathematics in the Modern World",
    "Multimedia Systems",
    "Object Oriented Programming",
    "PC Troubleshooting and Networking",
    "Quantitative Methods",
    "Science, Technology and Society",
    "Web Systems and Technologies",
]

CANONICAL_BPE_COURSES = [
    "Applied Motor Control and Learning of Exercise Sports and Dance",
    "Assessment in Learning 1",
    "Assessment in Learning 2",
    "Building and Enhancing New Literacies Across the Curriculum",
    "Child and Adolescent Learners and Learning Principles",
    "Contemporary World",
    "Coordinated School Health Program",
    "Curriculum Development and Evaluation with Emphasis on Trainers Methodology II",
    "Dalumat Ng/Sa Filipino",
    "Drug Education, Consumer Health Education and Healthy Eating",
    "Emergency Preparedness and Safety Management",
    "Ethics",
    "Facilitating Learner-Centered Teaching",
    "Foundation of Special and Inclusive Education",
    "International Folk Dance and Other Dance Forms",
    "Kontekstwalisadong Komunikasyon sa Filipino",
    "Life and Works of Rizal",
    "Movement Education",
    "Personal, Community and Environmental Health",
    "Philippine Government and Constitution",
    "Philippine Popular Culture",
    "Philippine Traditional Dances",
    "Philippine Traditional Games and Sports",
    "Philosophy of Socio-Anthropological Foundations of PE and Sports",
    "Purposive Communication",
]

CANONICAL_37_PHYSICAL_ZONES = [
    "WORKSTATION",
    "WORKSTATION 2",
    "WORKSTATION 3",
    "WORKSTATION 4",
    "WORKSTATION 5",
    "TUTORIUM ROOM POLICY",
    "SPECIAL COLLECTION SECTION",
    "SOCIAL LEARNING ZONE",
    "SOCIAL LEARNING ZONE 2",
    "SOCIAL LEARNING ZONE 3",
    "SOCIAL LEARNING ZONE 4",
    "SOCIAL LEARNING ZONE 5",
    "RESEARCH SECTION",
    "RESEARCH & FICTION SECTION",
    "RESEARCH & FICTION SECTION 2",
    "REFERENCE SECTION",
    "RECEIVING AREA 4",
    "RECEIVING AREA - 2nd floor",
    "READING AREA",
    "READING AREA 2",
    "READING AREA 3",
    "READING AREA - 2ND FLOOR",
    "PERIODICAL SECTION",
    "MULTIMEDIA USAGE POLICY",
    "MULTIMEDIA SECTION",
    "LOG-OUT SYSTEM",
    "LOG-IN STATION",
    "LIBRARY PERSONNEL",
    "INFORMATION COUNTER 2",
    "INFORMATION COUNTER 1",
    "HONESTY STORE",
    "FACULTY CORNER 2",
    "FACULTY CORNER 1",
    "DISCUSSION ROOM GUIDELINES",
    "CIRCULATION SECTION",
    "BAGGAGE SECTION 2",
    "BAGGAGE SECTION 1",
]


def _ensure_canonical_dataset_seeded() -> None:
    """
    Populates the canonical 13-table dataset if running inside an isolated empty Django test DB
    (`python manage.py test`). No-ops when running against the already-populated live DB.
    """
    if EResourceDepartment.objects.count() == 0:
        agri = EResourceDepartment.objects.create(name="AGRI", parent=None, order=1)
        EResourceDepartment.objects.create(name="BS Agriculture", parent=agri, order=1)

        caf = EResourceDepartment.objects.create(name="CAF", parent=None, order=2)
        bsabe = EResourceDepartment.objects.create(name="BIOSYSTEM ENGINEERING", parent=caf, order=1)
        for idx, cname in enumerate(
            [
                "1st year",
                "2ND YEAR",
                "3rd year",
                "Fourth Year",
                "Other related books for BSABE",
            ],
            start=1,
        ):
            EResourceDepartment.objects.create(name=cname, parent=bsabe, order=idx)

        EResourceDepartment.objects.create(name="CBA", parent=None, order=3)

        ccs = EResourceDepartment.objects.create(name="CCS", parent=None, order=4)
        EResourceDepartment.objects.create(name="BSCS", parent=ccs, order=1)
        bsis = EResourceDepartment.objects.create(name="BSIS", parent=ccs, order=2)
        for idx, cname in enumerate(CANONICAL_BSIS_COURSES, start=1):
            EResourceDepartment.objects.create(name=cname, parent=bsis, order=idx)

        cted = EResourceDepartment.objects.create(name="CTED", parent=None, order=5)
        EResourceDepartment.objects.create(name="BEED", parent=cted, order=1)
        bpe = EResourceDepartment.objects.create(name="BPE", parent=cted, order=2)
        for idx, cname in enumerate(CANONICAL_BPE_COURSES, start=1):
            EResourceDepartment.objects.create(name=cname, parent=bpe, order=idx)

    if LibraryInteriorImage.objects.count() == 0:
        for title in CANONICAL_37_PHYSICAL_ZONES:
            LibraryInteriorImage.objects.create(
                title=title,
                image="library_interiors/sample.jpg",
                section_label="Physical Setup",
                is_active=True,
            )
        for i in range(1, 18):
            LibraryInteriorImage.objects.create(
                title=f"IMG_{i:04d}",
                image=f"library_interiors/IMG_{i:04d}.jpg",
                section_label="Library Interior",
                is_active=True,
            )

    if ManagedLink.objects.count() == 0:
        acquired = [
            ("Bookshelf", "https://www.vitalsource.com/"),
            ("Scholaar", "https://scholaar.com/"),
        ]
        for idx, (name, url) in enumerate(acquired, start=1):
            ManagedLink.objects.create(
                category="Acquired E-Resources",
                name=name,
                url=url,
                order=idx,
                is_active=True,
            )

        resources = [
            ("Science Direct", "https://www.sciencedirect.com/"),
            ("Philippine Elib", "http://www.elib.gov.ph/"),
            ("ERIC Educ. Res. Info. Center", "https://eric.ed.gov/"),
            ("Gale Database", "https://www.gale.com/"),
            ("Philippine E-Journals", "https://ejournals.ph/"),
            ("Springer Nature Link", "https://link.springer.com/"),
            ("E-Library USA", "https://elibraryusa.state.gov/"),
            ("Seameo-innotech eBooks", "https://www.seameo-innotech.org/"),
            ("ProQuest", "https://www.proquest.com/"),
        ]
        for idx, (name, url) in enumerate(resources, start=1):
            ManagedLink.objects.create(
                category="Resources",
                name=name,
                url=url,
                order=idx,
                is_active=True,
            )

        open_access = [
            ("Agriculture", "https://www.agris.fao.org/"),
            ("Lis of Scientific Journal", "https://www.scimagojr.com/"),
            ("List of Academic Journal", "https://doaj.org/"),
            ("Worldcat", "https://www.worldcat.org/"),
            ("Google Book", "https://books.google.com/"),
            ("Online Free E-Books", "https://manybooks.net/"),
            ("Gutenberg", "https://www.gutenberg.org/"),
            ("Scribd", "https://www.scribd.com/"),
            ("GetFreeEbooks", "https://www.getfreeebooks.com/"),
            ("DOST Publication", "https://stii.dost.gov.ph/"),
            ("Highwire Press", "https://www.highwirepress.com/"),
            ("IPL Magazines", "https://www.ipl.org/"),
        ]
        for idx, (name, url) in enumerate(open_access, start=1):
            ManagedLink.objects.create(
                category="Open Access Journal",
                name=name,
                url=url,
                order=idx,
                is_active=True,
            )

    if PageContent.objects.count() == 0:
        services_html = "\n".join(f"<p>{s}</p>" for s in CANONICAL_17_SERVICES)
        PageContent.objects.create(
            slug="library_services",
            title="Our 17 Library Services",
            content=services_html,
        )
        PageContent.objects.create(
            slug="about_history",
            title="History of JRMSU Katipunan Campus",
            content=(
                "<p>Jose Rizal Memorial State University (JRMSU) was elevated to university status "
                "on December 15, 2009 by virtue of Republic Act No. 9852.</p>"
            ),
        )
        PageContent.objects.create(
            slug="about_quality",
            title="JRMSU Library Quality Objectives",
            content=(
                "<p>Increase the acquisition of print, digital, and multimedia resources by 10% annually.</p>"
            ),
        )
        PageContent.objects.create(
            slug="personnel_text",
            title="Librarian's Corner Text",
            content=(
                "<p>From pages to possibilities—the JRMSU Library fosters knowledge, research, "
                "and lifelong learning in pursuit of excellence.</p>"
                "<p>Thank you for making the library part of your journey. Padayon, JRMSUans!</p>"
            ),
        )

    if ManagedFile.objects.count() == 0:
        ManagedFile.objects.create(
            category="OrgStructure",
            name="Organizational Structure",
            file="managed_files/organizational_structure_library.png",
            is_active=True,
        )
        ManagedFile.objects.create(
            category="Excellence",
            name="Excellence in Information",
            file="managed_files/JRMSU_library_lib.jpg",
            is_active=True,
        )

    if Personnel.objects.count() == 0:
        staff = [
            ("Kiara Keren M. Alavanza", "Campus Librarian", 1),
            ("Marquita P. Morata", "Staff, Library", 2),
            ("Bernie Rey L. Palon", "Staff, Library", 3),
            ("Reizel C. Rosauro", "Staff, Library", 4),
        ]
        for name, title, order in staff:
            Personnel.objects.create(name=name, title=title, order=order)

    if SiteSettings.objects.count() == 0:
        SiteSettings.objects.create(
            library_name="JRMSU Katipunan Library",
            address="Katipunan, Zamboanga del Norte",
            contact_email="katipunan.library@jrmsu.edu.ph",
            alternate_email="jrmsukclibrary@gmail.com",
            opening_hours_mon_fri="7:00 AM - 7:00 PM",
            opening_hours_sat="Closed",
            opening_hours_sun="Closed",
        )

    if AcquisitionBatch.objects.count() == 0:
        batch = AcquisitionBatch.objects.create(
            name="Batch 1 2026",
            description="Newly Acquired Books Batch 1 2026",
            status="open",
            is_display_batch=True,
        )
        if NewlyAcquiredBook.objects.count() == 0:
            books = [
                NewlyAcquiredBook(
                    batch=batch,
                    title=f"IMG_2026_{i:04d}",
                    author="",
                    category="Imported",
                    cover_image=f"books/covers/IMG_{i:04d}.jpg",
                )
                for i in range(1, 136)
            ]
            NewlyAcquiredBook.objects.bulk_create(books)

    if AIFaqCache.objects.count() == 0:
        AIFaqCache.objects.create(
            question="what are the library hours",
            answers=["The JRMSU Katipunan Campus Library is open Monday to Friday from 7:00 AM to 7:00 PM."],
        )


class AIReadViewVerificationTests(TestCase):
    """
    Verification suite for:
      1. AST/Source Security Boundary against the 8 restricted PII/Admin models
      2. Algorithm 1: Multi-field weighted book & reference ranking + tie-breaking
      3. Algorithm 2: 60-node E-Resource hierarchy & course breadcrumb matching
      4. Algorithm 3: 54-record Physical Setup (37) vs. Interior Photo (17) grouping
      5. Algorithm 4: 23 ManagedLink category grouping & 17 Library Services HTML extraction
      6. Algorithm 5 & End-to-End 13-Table Live Response Verification
    """

    @classmethod
    def setUpTestData(cls):
        _ensure_canonical_dataset_seeded()

    # -------------------------------------------------------------------------
    # 1. Security Boundary Verification Test
    # -------------------------------------------------------------------------
    def test_01_security_boundary_ast_and_source_verification(self):
        """
        Inspects the AST and source of `ai_service.py` and `ai_read_view_helper.py`
        to assert that NONE of the 8 restricted models (`Account`, `ContactMessage`,
        `ContactAttachment`, `Feedback`, `SiteVisit`, `RecycleBin`, `GeneratedReport`,
        `BatchHistory`) are imported or queried.
        """
        target_files = [
            BACKEND_DIR / "Features" / "Services" / "Implementations" / "ai_service.py",
            BACKEND_DIR / "Features" / "Helpers" / "ai_read_view_helper.py",
        ]

        for file_path in target_files:
            self.assertTrue(file_path.exists(), f"Expected file to exist: {file_path}")
            source = file_path.read_text(encoding="utf-8")
            tree = ast.parse(source, filename=str(file_path))

            imported_symbols = set()
            imported_modules = set()
            referenced_identifiers = set()

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imported_modules.add(alias.name)
                        imported_symbols.add(alias.asname or alias.name.split(".")[-1])
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imported_modules.add(node.module)
                    for alias in node.names:
                        imported_symbols.add(alias.asname or alias.name)
                elif isinstance(node, ast.Name):
                    referenced_identifiers.add(node.id)
                elif isinstance(node, ast.Attribute):
                    referenced_identifiers.add(node.attr)

            for restricted in RESTRICTED_MODEL_NAMES:
                self.assertNotIn(
                    restricted,
                    imported_symbols,
                    f"Restricted model '{restricted}' must NEVER be imported in {file_path.name}",
                )
                self.assertNotIn(
                    restricted,
                    referenced_identifiers,
                    f"Restricted model identifier '{restricted}' must NEVER be referenced or queried in {file_path.name}",
                )
                self.assertNotIn(
                    f"{restricted}.objects",
                    source,
                    f"Restricted ORM query '{restricted}.objects' found in {file_path.name}",
                )

    # -------------------------------------------------------------------------
    # 2. Algorithm 1 (`rank_and_sort_books` & `rank_and_sort_references`) Test
    # -------------------------------------------------------------------------
    def test_02_algorithm_1_rank_and_sort_books_and_references(self):
        """
        Tests multi-field weighted scoring & deterministic tie-breaking with mock/in-memory
        objects (verifying exact title phrase match > title token match > category/department
        match > author match, and softcopy boost on references, while excluding `IMG*` /
        `Imported` picture covers from named books).
        """
        # Verify query token expansion & stopword filtering
        expanded = AIReadViewHelper.expand_query_tokens("Find me a book about programming in CCS")
        self.assertIn("programming", expanded)
        self.assertIn("ccs", expanded)
        self.assertIn("bsis", expanded)
        self.assertNotIn("find", expanded)
        self.assertNotIn("the", expanded)

        # Mock Book objects for multi-field weighted ranking
        img_cover_1 = SimpleNamespace(
            id=1,
            title="IMG_20260101_0001",
            author="",
            category="General",
            accession_number="ACC-001",
        )
        img_cover_2 = SimpleNamespace(
            id=2,
            title="Scan Cover 02",
            author="",
            category="Imported",
            accession_number="ACC-002",
        )
        book_author_match = SimpleNamespace(
            id=3,
            title="Modern Software Engineering",
            author="Dr. Data Structures",
            category="General Computing",
            accession_number="ACC-103",
        )
        book_category_match = SimpleNamespace(
            id=4,
            title="Introduction to Algorithms",
            author="Thomas Cormen",
            category="Data Structures",
            accession_number="ACC-104",
        )
        book_title_token_match = SimpleNamespace(
            id=5,
            title="Advanced Structures for Databases and Data",
            author="Jane Doe",
            category="Computer Science",
            accession_number="ACC-105",
        )
        book_exact_phrase_match = SimpleNamespace(
            id=6,
            title="Data Structures and Algorithms in Python",
            author="Michael Goodrich",
            category="General",
            accession_number="ACC-106",
        )
        book_tie_b = SimpleNamespace(
            id=7,
            title="Beta Network Guide",
            author="John Smith",
            category="Networking",
            accession_number="ACC-107",
        )
        book_tie_a = SimpleNamespace(
            id=8,
            title="Alpha Network Guide",
            author="John Smith",
            category="Networking",
            accession_number="ACC-108",
        )

        mock_books = [
            img_cover_1,
            img_cover_2,
            book_author_match,
            book_category_match,
            book_title_token_match,
            book_exact_phrase_match,
        ]

        ranked_books = AIReadViewHelper.rank_and_sort_books(
            mock_books,
            query_tokens=["data", "structures"],
            raw_query="data structures",
            limit=5,
        )

        # IMG* and category=='Imported' must be excluded
        self.assertEqual(len(ranked_books), 4)
        for b in ranked_books:
            self.assertFalse(AIReadViewHelper.is_imported_cover_book(b))

        # Exact phrase match (+12 + 5 + 5 = 22.0) > Title token match (+5 + 5 = 10.0)
        # > Category match (+4 + 4 = 8.0) > Author match (+3.5 + 3.5 = 7.0)
        self.assertEqual(
            [b.id for b in ranked_books],
            [
                book_exact_phrase_match.id,
                book_title_token_match.id,
                book_category_match.id,
                book_author_match.id,
            ],
        )

        # Deterministic alphabetical tie-breaking on equal scores
        tie_ranked = AIReadViewHelper.rank_and_sort_books(
            [book_tie_b, book_tie_a],
            query_tokens=["network"],
            raw_query="network",
            limit=5,
        )
        self.assertEqual([b.title for b in tie_ranked], ["Alpha Network Guide", "Beta Network Guide"])

        # Mock ResearchReference objects verifying field weights + softcopy boost (+1.5)
        ref_physical_only = SimpleNamespace(
            id=10,
            title="Machine Learning Crop Yield Prediction",
            author="A. Researcher",
            department="BSCS",
            category="Thesis and Dissertation",
            call_number="TH-001",
            acc_no="R-001",
            access_type="none",
        )
        ref_softcopy_pdf = SimpleNamespace(
            id=11,
            title="Machine Learning Anomaly Detection",
            author="B. Researcher",
            department="BSCS",
            category="Thesis and Dissertation",
            call_number="TH-002",
            acc_no="R-002",
            access_type="file",
        )
        ref_exact_phrase = SimpleNamespace(
            id=12,
            title="Deep Machine Learning for Smart Agriculture",
            author="C. Researcher",
            department="BSIS",
            category="Thesis and Dissertation",
            call_number="TH-003",
            acc_no="R-003",
            access_type="link",
        )
        ref_author_only = SimpleNamespace(
            id=13,
            title="Automated Irrigation System",
            author="Prof. Machine Learning",
            department="BSABE",
            category="Research for College Student in JRMSU",
            call_number="TH-004",
            acc_no="R-004",
            access_type="none",
        )

        ranked_refs = AIReadViewHelper.rank_and_sort_references(
            [ref_author_only, ref_physical_only, ref_softcopy_pdf, ref_exact_phrase],
            query_tokens=["machine", "learning"],
            raw_query="deep machine learning",
            limit=5,
        )

        # Exact phrase match first, then softcopy PDF boost (+1.5) beats physical-only with same token hits, then author match
        self.assertEqual(
            [r.id for r in ranked_refs],
            [
                ref_exact_phrase.id,
                ref_softcopy_pdf.id,
                ref_physical_only.id,
                ref_author_only.id,
            ],
        )

        # ---------------------------------------------------------------------
        # Negative test cases for short acronyms ('it', 'pe', 'cs', 'ai'):
        # Assert that short acronym tokens do NOT match substring noise in unrelated words.
        # ---------------------------------------------------------------------
        noisy_book_with = SimpleNamespace(
            id=101,
            title="Living With Literature",
            author="Author One",
            category="General",
            accession_number="ACC-N01",
        )
        noisy_book_operating = SimpleNamespace(
            id=102,
            title="Operating Systems Concepts",
            author="Author Two",
            category="General",
            accession_number="ACC-N02",
        )
        noisy_book_basics = SimpleNamespace(
            id=103,
            title="Basics of Economic Statistics",
            author="Author Three",
            category="General",
            accession_number="ACC-N03",
        )
        noisy_book_daily = SimpleNamespace(
            id=104,
            title="Daily Living",
            author="Author Four",
            category="General",
            accession_number="ACC-N04",
        )

        genuine_it_book = SimpleNamespace(
            id=201,
            title="Introduction to IT Systems",
            author="Alan Turing",
            category="General",
            accession_number="ACC-IT1",
        )
        genuine_pe_book = SimpleNamespace(
            id=202,
            title="Fundamentals of PE and Sports",
            author="John Coach",
            category="General",
            accession_number="ACC-PE1",
        )
        genuine_cs_book = SimpleNamespace(
            id=203,
            title="CS Programming Concepts",
            author="Grace Hopper",
            category="General",
            accession_number="ACC-CS1",
        )
        genuine_ai_book = SimpleNamespace(
            id=204,
            title="AI and Machine Learning Essentials",
            author="Marvin Minsky",
            category="General",
            accession_number="ACC-AI1",
        )

        # 1. Query 'it': Assert that 'it' does NOT match 'With' or 'Literature'
        self.assertEqual(
            AIReadViewHelper._match_token_in_text(
                "it",
                noisy_book_with.title.lower(),
                set(noisy_book_with.title.lower().split()),
            ),
            0.0,
            "'it' must NOT match 'With' or 'Literature'",
        )
        it_ranked = AIReadViewHelper.rank_and_sort_books(
            [noisy_book_with, genuine_it_book],
            query_tokens=["it"],
            raw_query="it",
            limit=5,
        )
        self.assertIn(genuine_it_book, it_ranked)
        self.assertNotIn(
            noisy_book_with,
            it_ranked,
            "Querying 'it' must NOT match 'Living With Literature'",
        )

        # 2. Query 'pe': Assert that 'pe' does NOT match 'Operating' or 'Concepts'
        self.assertEqual(
            AIReadViewHelper._match_token_in_text(
                "pe",
                noisy_book_operating.title.lower(),
                set(noisy_book_operating.title.lower().split()),
            ),
            0.0,
            "'pe' must NOT match 'Operating' or 'Concepts'",
        )
        pe_ranked = AIReadViewHelper.rank_and_sort_books(
            [noisy_book_operating, genuine_pe_book],
            query_tokens=["pe"],
            raw_query="pe",
            limit=5,
        )
        self.assertIn(genuine_pe_book, pe_ranked)
        self.assertNotIn(
            noisy_book_operating,
            pe_ranked,
            "Querying 'pe' must NOT match 'Operating Systems Concepts'",
        )

        # 3. Query 'cs': Assert that 'cs' does NOT match 'Basics' or 'Statistics' or 'Economics'
        self.assertEqual(
            AIReadViewHelper._match_token_in_text(
                "cs",
                noisy_book_basics.title.lower(),
                set(noisy_book_basics.title.lower().split()),
            ),
            0.0,
            "'cs' must NOT match 'Basics', 'Statistics', or 'Economics'",
        )
        cs_ranked = AIReadViewHelper.rank_and_sort_books(
            [noisy_book_basics, genuine_cs_book],
            query_tokens=["cs"],
            raw_query="cs",
            limit=5,
        )
        self.assertIn(genuine_cs_book, cs_ranked)
        self.assertNotIn(
            noisy_book_basics,
            cs_ranked,
            "Querying 'cs' must NOT match 'Basics of Economic Statistics'",
        )

        # 4. Query 'ai': Assert that 'ai' does NOT match 'Daily'
        self.assertEqual(
            AIReadViewHelper._match_token_in_text(
                "ai",
                noisy_book_daily.title.lower(),
                set(noisy_book_daily.title.lower().split()),
            ),
            0.0,
            "'ai' must NOT match 'Daily'",
        )
        ai_ranked = AIReadViewHelper.rank_and_sort_books(
            [noisy_book_daily, genuine_ai_book],
            query_tokens=["ai"],
            raw_query="ai",
            limit=5,
        )
        self.assertIn(genuine_ai_book, ai_ranked)
        self.assertNotIn(
            noisy_book_daily,
            ai_ranked,
            "Querying 'ai' must NOT match 'Daily Living'",
        )

        # 5. Also assert negative matching for research references
        noisy_ref_with = SimpleNamespace(
            id=301,
            title="Living With Literature",
            department="General",
            category="General",
            author="Author One",
            call_number="CN-01",
            acc_no="R-N01",
            access_type="none",
        )
        genuine_it_ref = SimpleNamespace(
            id=302,
            title="IT Frameworks and Modern Computing",
            department="General",
            category="General",
            author="Author Two",
            call_number="CN-02",
            acc_no="R-IT1",
            access_type="file",
        )
        ref_it_ranked = AIReadViewHelper.rank_and_sort_references(
            [noisy_ref_with, genuine_it_ref],
            query_tokens=["it"],
            raw_query="it",
            limit=5,
        )
        self.assertIn(genuine_it_ref, ref_it_ranked)
        self.assertNotIn(
            noisy_ref_with,
            ref_it_ranked,
            "Querying 'it' must NOT match ResearchReference 'Living With Literature'",
        )

    # -------------------------------------------------------------------------
    # 3. Algorithm 2 (`build_sorted_eresource_tree` & `match_eresource_folders`)
    # -------------------------------------------------------------------------
    def test_03_algorithm_2_eresource_tree_and_folder_matching(self):
        """
        Verifies that querying `'CCS BSIS'`, `'programming'`, or `'CTED BPE'` against the
        60 `EResourceDepartment` rows returns the exact sorted course breadcrumb paths
        (e.g. `CCS > BSIS > Data Structures an Algorithms`,
        `CTED > BPE > Philippine Government and Constitution`).
        """
        departments = list(
            EResourceDepartment.objects.select_related("parent", "parent__parent").order_by("order", "id")
        )
        self.assertEqual(len(departments), 60, "Expected 60 EResourceDepartment rows")

        tree = AIReadViewHelper.build_sorted_eresource_tree(departments)
        self.assertEqual(tree["counts"]["total"], 60)
        self.assertEqual(tree["counts"]["colleges"], 5)
        self.assertEqual(tree["counts"]["programs"], 6)
        self.assertEqual(tree["counts"]["courses"], 49)
        self.assertEqual(
            [r["name"] for r in tree["roots"]],
            ["AGRI", "CAF", "CBA", "CCS", "CTED"],
        )

        # 1. Query 'CCS BSIS'
        ccs_bsis_tokens = AIReadViewHelper.expand_query_tokens("CCS BSIS")
        ccs_bsis_matches = AIReadViewHelper.match_eresource_folders(
            departments, ccs_bsis_tokens, raw_query="CCS BSIS", limit=25
        )
        ccs_bsis_breadcrumbs = [m["breadcrumb"] for m in ccs_bsis_matches]
        self.assertIn("CCS > BSIS > Data Structures an Algorithms", ccs_bsis_breadcrumbs)
        self.assertIn("CCS > BSIS > Object Oriented Programming", ccs_bsis_breadcrumbs)
        self.assertIn("CCS > BSIS > Web Systems and Technologies", ccs_bsis_breadcrumbs)
        # All top matches must belong to CCS > BSIS course level (depth == 2)
        self.assertTrue(all(m["breadcrumb"].startswith("CCS > BSIS > ") for m in ccs_bsis_matches[:10]))

        # 2. Query 'programming'
        prog_tokens = AIReadViewHelper.expand_query_tokens("programming")
        prog_matches = AIReadViewHelper.match_eresource_folders(
            departments, prog_tokens, raw_query="programming", limit=15
        )
        prog_breadcrumbs = [m["breadcrumb"] for m in prog_matches]
        self.assertIn("CCS > BSIS > Fundamentals of Programming", prog_breadcrumbs)
        self.assertIn("CCS > BSIS > Intermediate Programming", prog_breadcrumbs)
        self.assertIn("CCS > BSIS > Object Oriented Programming", prog_breadcrumbs)
        self.assertIn("CCS > BSIS > Data Structures an Algorithms", prog_breadcrumbs)

        # 3. Query 'CTED BPE'
        cted_bpe_tokens = AIReadViewHelper.expand_query_tokens("CTED BPE")
        cted_bpe_matches = AIReadViewHelper.match_eresource_folders(
            departments, cted_bpe_tokens, raw_query="CTED BPE", limit=30
        )
        cted_bpe_breadcrumbs = [m["breadcrumb"] for m in cted_bpe_matches]
        self.assertIn("CTED > BPE > Philippine Government and Constitution", cted_bpe_breadcrumbs)
        self.assertIn(
            "CTED > BPE > Applied Motor Control and Learning of Exercise Sports and Dance",
            cted_bpe_breadcrumbs,
        )
        self.assertIn("CTED > BPE > Assessment in Learning 1", cted_bpe_breadcrumbs)
        self.assertTrue(all(m["breadcrumb"].startswith("CTED > BPE > ") for m in cted_bpe_matches[:15]))

    # -------------------------------------------------------------------------
    # 4. Algorithm 3 (`group_and_sort_physical_zones`) Verification Test
    # -------------------------------------------------------------------------
    def test_04_algorithm_3_group_and_sort_physical_zones(self):
        """
        Verifies separation of the 37 `Physical Setup` zones from the 17 `Library Interior`
        `IMG*` photos (`54` total) and grouped workstation/learning-zone aggregation.
        """
        images = list(LibraryInteriorImage.objects.filter(is_active=True))
        self.assertEqual(len(images), 54, "Expected 54 active LibraryInteriorImage records")

        zone_data = AIReadViewHelper.group_and_sort_physical_zones(
            images, query_tokens=["workstation", "learning"]
        )
        self.assertEqual(zone_data["physical_setup_count"], 37)
        self.assertEqual(zone_data["interior_photo_count"], 17)
        self.assertEqual(zone_data["total_count"], 54)

        by_base_zone = {g["base_zone"]: g for g in zone_data["grouped_zones"]}
        self.assertIn("WORKSTATION", by_base_zone)
        self.assertEqual(by_base_zone["WORKSTATION"]["count"], 5)

        # Social Learning Zone aggregation (handling single/multiple spaces)
        social_learning_count = sum(
            g["count"]
            for base_name, g in by_base_zone.items()
            if "SOCIAL" in base_name and "LEARNING ZONE" in base_name
        )
        self.assertEqual(social_learning_count, 5)

        self.assertIn("READING AREA", by_base_zone)
        self.assertEqual(by_base_zone["READING AREA"]["count"], 4)
        self.assertIn("2nd Floor", by_base_zone["READING AREA"]["floors"])
        self.assertTrue(len(zone_data["matched_zones"]) > 0)

    # -------------------------------------------------------------------------
    # 5. Algorithm 4 (`group_and_sort_managed_links` & `extract_html_list_items`)
    # -------------------------------------------------------------------------
    def test_05_algorithm_4_managed_links_and_html_list_items(self):
        """
        Verifies all 23 `ManagedLink` rows are grouped into `Acquired E-Resources`,
        `Resources`, and `Open Access Journal`, and `extract_html_list_items` extracts
        all 17 Library Services from `PageContent(slug='library_services')`.
        """
        links = list(ManagedLink.objects.filter(is_active=True))
        self.assertEqual(len(links), 23, "Expected 23 active ManagedLink rows")

        grouped = AIReadViewHelper.group_and_sort_managed_links(
            links, query_tokens=["vitalsource", "bookshelf", "worldcat"]
        )
        self.assertEqual(grouped["total_active"], 23)
        self.assertEqual(grouped["category_counts"]["Acquired E-Resources"], 2)
        self.assertEqual(grouped["category_counts"]["Resources"], 9)
        self.assertEqual(grouped["category_counts"]["Open Access Journal"], 12)

        acquired_names = [item["name"] for item in grouped["by_category"]["Acquired E-Resources"]]
        self.assertEqual(acquired_names, ["Bookshelf", "Scholaar"])

        # Extract all 17 Library Services from PageContent(slug='library_services')
        services_page = PageContent.objects.filter(slug="library_services").first()
        self.assertIsNotNone(services_page, "PageContent(slug='library_services') must exist")

        extracted_services = AIReadViewHelper.extract_html_list_items(services_page.content)
        self.assertEqual(len(extracted_services), 17, "Expected exactly 17 Library Services")
        self.assertEqual(extracted_services[0], "Library User Education")
        self.assertEqual(extracted_services[-1], "Online Databases Service")
        self.assertEqual(extracted_services, CANONICAL_17_SERVICES)

    # -------------------------------------------------------------------------
    # 6. Algorithm 5 & End-to-End 13-Table Live Response Verification Test
    # -------------------------------------------------------------------------
    def test_06_algorithm_5_and_end_to_end_13_table_live_responses(self):
        """
        Queries `AIService().generate_chat_response(...)` across all 13 benchmark prompts
        to verify deterministic, zero-hallucination responses grounded in the 13 tables.
        """
        service = AIService()

        # Verify Algorithm 5 helper report directly as well
        if hasattr(service, "get_read_view_audit_summary"):
            audit_summary = service.get_read_view_audit_summary()
            self.assertIsInstance(audit_summary, dict)
            audit_report = AIReadViewHelper.build_live_database_audit_report(audit_summary)
        else:
            audit_report = AIReadViewHelper.build_live_database_audit_report({})
        self.assertIn("Live Database Read/View Access Report", audit_report)
        self.assertIn("60", audit_report)
        self.assertIn("23", audit_report)
        self.assertIn("17", audit_report)

        prompt_expectations = [
            (
                "what tables and data can you read and view?",
                ["60", "23", "135"],
            ),
            (
                "what folders are under CCS BSIS?",
                ["CCS", "BSIS", "Data Structures"],
            ),
            (
                "what subjects are under CTED BPE?",
                ["CTED", "BPE", "Applied Motor Control", "Assessment in Learning"],
            ),
            (
                "what are the 17 library services?",
                ["17", "Circulation", "Printing"],
            ),
            (
                "what is the organizational structure of the library?",
                ["Kiara Keren M. Alavanza", "Organizational Structure"],
            ),
            (
                "what is in the librarian's corner?",
                ["From pages to possibilities", "Padayon"],
            ),
            (
                "what open access journals and online databases do you have?",
                ["23", "Bookshelf", "Scholaar"],
            ),
            (
                "what are the physical setup sections?",
                ["37", "Workstation", "Social Learning"],
            ),
            (
                "any books available?",
                ["135", "Batch 1 2026"],
            ),
            (
                "any reference books?",
                ["Research", "Reference"],
            ),
            (
                "Reservation of room?",
                ["Discussion Room", "Tutorium Room", "Multimedia Room"],
            ),
            (
                "who are you?",
                ["Rizal", "JRMSU", "Katipunan"],
            ),
            (
                "who is the librarian?",
                ["Kiara Keren M. Alavanza"],
            ),
            (
                "what is the core values for the jrmsu and the library?",
                ["Quality Objectives", "Vision"],
            ),
        ]

        banned_hallucinations = [
            "alibaba cloud",
            "qwen",
            "art of war",
            "sapiens",
            "the alchemist",
            "braveheart",
            "william shakespeare",
            "hello, rizal",
            "hi, rizal",
        ]

        for query, expected_substrings in prompt_expectations:
            response = service.generate_chat_response(query, chat_history=[])
            self.assertTrue(
                bool(response and response.strip()),
                f"Empty response for query: {query}",
            )
            lower_resp = response.lower()
            for banned in banned_hallucinations:
                self.assertNotIn(
                    banned,
                    lower_resp,
                    f"Hallucinated/banned phrase '{banned}' found in response to '{query}': {response}",
                )
            for expected in expected_substrings:
                self.assertIn(
                    expected.lower(),
                    lower_resp,
                    f"Expected '{expected}' in response to '{query}', got:\n{response}",
                )


if __name__ == "__main__":
    unittest.main(verbosity=2)

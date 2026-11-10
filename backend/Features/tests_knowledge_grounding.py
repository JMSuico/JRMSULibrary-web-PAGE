import ast
import unittest
import importlib.machinery
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import MagicMock

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

# ── 1. MOCK MINIMAL DJANGO ENVIRONMENT ──────────────────────────────────
for mod_name in ['django', 'django.core', 'django.core.cache', 'django.db', 'django.db.models', 'django.conf']:
    if mod_name not in sys.modules:
        m = ModuleType(mod_name)
        sys.modules[mod_name] = m

sys.modules['django.core.cache'].cache = MagicMock()

# ── 2. LOAD AI READ VIEW HELPER DIRECTLY ─────────────────────────────────
helper_path = backend_path / "Features" / "Helpers" / "ai_read_view_helper.py"
helper_loader = importlib.machinery.SourceFileLoader('ai_read_view_helper', str(helper_path))
helper_mod = helper_loader.load_module()
AIReadViewHelper = helper_mod.AIReadViewHelper
match_and_format_file_knowledge = helper_mod.match_and_format_file_knowledge
match_and_format_thesis_knowledge = helper_mod.match_and_format_thesis_knowledge

# ── 3. LOAD AI SERVICE DIRECTLY ──────────────────────────────────────────
mock_repo = ModuleType("Features.Repositories.Implementations")
for r in [
    'PersonnelRepository', 'ManagedLinkRepository', 'PageContentRepository',
    'ManagedFileRepository', 'PageImageRepository', 'BatchRepository',
    'NewlyAcquiredBookRepository', 'ResearchReferenceRepository',
    'AIFaqRepository', 'LibraryInteriorImageRepository', 'SettingsRepository',
    'EResourceDepartmentRepository', 'EResourceFileRepository'
]:
    setattr(mock_repo, r, MagicMock)

feat_pkg = ModuleType('Features')
feat_pkg.__path__ = [str(backend_path / 'Features')]
sys.modules['Features'] = feat_pkg
sys.modules['Features.Repositories'] = ModuleType('Features.Repositories')
sys.modules['Features.Repositories.Implementations'] = mock_repo
sys.modules['Features.Repositories.Implementations.personnel_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.cms_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.batch_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.book_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.reference_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.ai_faq_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.gallery_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.settings_repository'] = mock_repo
sys.modules['Features.Repositories.Implementations.eresource_repository'] = mock_repo

mock_mgmt = ModuleType('Features.management')
mock_mgmt_cmds = ModuleType('Features.management.commands')
mock_extract_cmd = ModuleType('Features.management.commands.extract_file_knowledge')
mock_extract_cmd.process_single_eresource_file = MagicMock(return_value=True)
mock_extract_cmd.process_single_research_reference = MagicMock(return_value=True)
sys.modules['Features.management'] = mock_mgmt
sys.modules['Features.management.commands'] = mock_mgmt_cmds
sys.modules['Features.management.commands.extract_file_knowledge'] = mock_extract_cmd

mock_iface = ModuleType('Features.Services.Interfaces.i_ai_service')
mock_iface.IAIService = object
sys.modules['Features.Services'] = ModuleType('Features.Services')
sys.modules['Features.Services.Interfaces'] = ModuleType('Features.Services.Interfaces')
sys.modules['Features.Services.Interfaces.i_ai_service'] = mock_iface

mock_helpers = ModuleType('Features.Helpers')
mock_helpers.AIReadViewHelper = AIReadViewHelper
mock_helpers.match_and_format_file_knowledge = match_and_format_file_knowledge
mock_helpers.match_and_format_thesis_knowledge = match_and_format_thesis_knowledge
sys.modules['Features.Helpers'] = mock_helpers
sys.modules['Features.Helpers.ai_read_view_helper'] = mock_helpers

ai_service_path = backend_path / "Features" / "Services" / "Implementations" / "ai_service.py"
ai_loader = importlib.machinery.SourceFileLoader('ai_service', str(ai_service_path))
ai_service_mod = ai_loader.load_module()
AIService = ai_service_mod.AIService


class TestKnowledgeGrounding(unittest.TestCase):

    def setUp(self):
        # Sample EResourceFile instances
        dept_caf = SimpleNamespace(name="CAF", parent=None)
        dept_agri = SimpleNamespace(name="BSABE - Agriculture", parent=dept_caf)
        self.file_agri = SimpleNamespace(
            id=1,
            name="Agriculture Handbook 2026.pdf",
            department=dept_agri,
            keywords=["farming", "soil conservation", "crops", "irrigation"],
            summary="Comprehensive field guide for modern agricultural engineering, crop rotation, and soil health management.",
            table_of_contents=["Chapter 1: Principles of Agronomy", "Chapter 2: Soil Health and Nutrients", "Chapter 3: Drip Irrigation and Water Conservation"],
            key_topics=["Crop Science", "Soil Fertility", "Irrigation Systems", "Pest Management"],
            is_active=True,
        )

        dept_ccs = SimpleNamespace(name="CCS", parent=None)
        dept_bsis = SimpleNamespace(name="BSIS", parent=dept_ccs)
        dept_ds = SimpleNamespace(name="Data Structures and Algorithms", parent=dept_bsis)
        self.file_cs = SimpleNamespace(
            id=2,
            name="Data Structures Syllabus & Chapter Guide.pdf",
            department=dept_ds,
            keywords=["algorithms", "programming", "trees", "graphs", "sorting"],
            summary="Core curriculum document detailing course modules, memory management, and search complexity.",
            chapters="Module 1: Arrays and Linked Lists, Module 2: Binary Search Trees, Module 3: Graph Traversal",
            concepts=["Time Complexity (Big-O)", "Tree Balancing", "Dijkstra Algorithm"],
            is_active=True,
        )

        self.file_inactive = SimpleNamespace(
            id=3,
            name="Outdated Agriculture Guide.pdf",
            department=dept_agri,
            keywords=["agriculture"],
            summary="Old version.",
            is_active=False,
        )

        self.all_files = [self.file_agri, self.file_cs, self.file_inactive]

        # Sample ResearchReference instances with extracted knowledge
        self.ref_fertilizer = SimpleNamespace(
            id=101,
            title="Yield Performance of Lowland Rice under Organic Vermicompost Fertilization in Katipunan",
            author="Maria Elena Santos",
            department="College of Agriculture and Forestry (CAF)",
            category="Thesis and Dissertation",
            call_number="THE-2025-01",
            methodology="Randomized Complete Block Design (RCBD) across four replicates over two wet-season crop cycles.",
            findings_conclusion="Organic vermicompost significantly increased panicle density and overall grain yield by 26.8% compared to synthetic treatments, while reducing soil acidity from pH 5.2 to pH 6.1.",
            abstract="This study evaluated the agro-morphological response of rice crops under organic management in Katipunan, Zamboanga del Norte.",
            access_type="file",
            access_file="theses/santos_2025.pdf",
        )

        self.ref_ai_attendance = SimpleNamespace(
            id=102,
            title="Automated Facial Recognition Attendance System for University Libraries",
            author="Juan Dela Cruz & Mark Ramos",
            department="College of Computer Studies (CCS)",
            category="Research for College Student in JRMSU",
            call_number="RES-2025-08",
            methodology="Deep learning convolutional neural network (CNN) with 68-point facial landmark regression tested against 500 patron enrollments.",
            findings_conclusion="The system achieved a 98.4% true-positive verification rate under standard library ambient illumination with average inference latency under 120ms.",
            abstract="Development and evaluation of an on-device facial recognition terminal for contactless library entry logging.",
            access_type="link",
            access_link="https://library.jrmsu.edu.ph/research/102",
        )

        self.ref_no_extracted_knowledge = SimpleNamespace(
            id=103,
            title="General Reference Dictionary of Science",
            author="Robert Brown",
            department="General Reference",
            category="Research for College Student in JRMSU",
            call_number="REF-001",
            abstract=None,
            methodology=None,
            findings_conclusion=None,
        )

        self.all_refs = [self.ref_fertilizer, self.ref_ai_attendance, self.ref_no_extracted_knowledge]

    # ── TEST 1: Match and Format E-Resource File Knowledge ──
    def test_match_and_format_file_knowledge(self):
        query = "What is in the agriculture handbook?"
        tokens = AIReadViewHelper.expand_query_tokens(query)

        # Call helper
        result = AIReadViewHelper.match_and_format_file_knowledge(self.all_files, tokens, raw_query=query, limit=2)
        
        self.assertTrue(len(result) > 0)
        self.assertIn("Agriculture Handbook 2026.pdf", result)
        self.assertIn("CAF > BSABE - Agriculture", result)
        self.assertIn("Soil Health and Nutrients", result)
        self.assertIn("Drip Irrigation", result)
        self.assertIn("Crop Science", result)
        # Inactive file should never appear
        self.assertNotIn("Outdated Agriculture Guide.pdf", result)
        # Token count check (under 300 tokens ~ approx 1200 chars)
        self.assertLess(len(result.split()), 200)

        # Also verify module-level function export
        standalone_res = match_and_format_file_knowledge(self.all_files, tokens, raw_query=query)
        self.assertEqual(result, standalone_res)

    # ── TEST 2: Match and Format Chapter/Syllabus Knowledge ──
    def test_match_file_chapters_and_topics(self):
        query = "Tell me about the chapters in the computer science syllabus"
        tokens = AIReadViewHelper.expand_query_tokens(query)

        result = AIReadViewHelper.match_and_format_file_knowledge(self.all_files, tokens, raw_query=query, limit=2)
        self.assertIn("Data Structures Syllabus & Chapter Guide.pdf", result)
        self.assertIn("CCS > BSIS > Data Structures and Algorithms", result)
        self.assertIn("Binary Search Trees", result)
        self.assertIn("Time Complexity (Big-O)", result)

    # ── TEST 3: Match and Format Thesis Knowledge (Methodology & Findings) ──
    def test_match_and_format_thesis_knowledge(self):
        query = "What are the findings of the thesis on organic fertilizer?"
        tokens = AIReadViewHelper.expand_query_tokens(query)

        result = AIReadViewHelper.match_and_format_thesis_knowledge(self.all_refs, tokens, raw_query=query, limit=2)
        self.assertTrue(len(result) > 0)
        self.assertIn("Yield Performance of Lowland Rice under Organic Vermicompost Fertilization in Katipunan", result)
        self.assertIn("Maria Elena Santos", result)
        self.assertIn("Randomized Complete Block Design", result)
        self.assertIn("26.8%", result)
        # Non-knowledge reference must be omitted
        self.assertNotIn("General Reference Dictionary of Science", result)
        # Concise token budget check
        self.assertLess(len(result.split()), 200)

        # Also verify module-level function export
        standalone_res = match_and_format_thesis_knowledge(self.all_refs, tokens, raw_query=query)
        self.assertEqual(result, standalone_res)

    # ── TEST 4: AIService Complexity Classification for Content Queries ──
    def test_complexity_classification_for_content_queries(self):
        service = AIService()
        
        tier, opts, inst = service._classify_query_complexity("What is in the agriculture handbook?")
        self.assertEqual(tier, "TIER_3")
        self.assertEqual(opts["num_predict"], 850)

        tier2, opts2, _ = service._classify_query_complexity("Tell me about the chapters in the syllabus")
        self.assertEqual(tier2, "TIER_3")
        self.assertEqual(opts2["num_predict"], 850)

        tier3, opts3, _ = service._classify_query_complexity("What are the findings of the thesis on rice yield?")
        self.assertEqual(tier3, "TIER_3")
        self.assertEqual(opts3["num_predict"], 850)

    # ── TEST 5: Query Resolution Flow: Deterministic Intent bypass for Content Questions ──
    def test_deterministic_intent_bypassed_for_content_queries(self):
        service = AIService()
        # Mock repositories so intent resolver has data if it runs
        service.reference_repo.get_count = MagicMock(return_value=5)
        service.reference_repo.search_multi_token = MagicMock(return_value=self.all_refs)
        service.book_repo.get_inventory_summary = MagicMock(return_value={'total': 10, 'named_count': 5, 'picture_count': 0, 'named_books': []})

        # Questions about specific book contents, chapters, or thesis findings MUST NOT return generic lists
        ans_handbook = service._resolve_deterministic_database_intent("What is in the agriculture handbook?")
        self.assertIsNone(ans_handbook, "Handbook content inquiry should bypass Tier 1 and go to Ollama Tier 3")

        ans_chapters = service._resolve_deterministic_database_intent("Tell me about the chapters in the computer science handbook")
        self.assertIsNone(ans_chapters, "Chapter inquiry should bypass Tier 1 and go to Ollama Tier 3")

        ans_findings = service._resolve_deterministic_database_intent("What are the findings of the thesis on organic fertilizer?")
        self.assertIsNone(ans_findings, "Thesis findings inquiry should bypass Tier 1 and go to Ollama Tier 3")

        # Standard catalog queries SHOULD still be resolved by Tier 1
        ans_std_books = service._resolve_deterministic_database_intent("recommend a book on programming")
        self.assertIsNotNone(ans_std_books)

        ans_std_theses = service._resolve_deterministic_database_intent("show me research thesis references")
        self.assertIsNotNone(ans_std_theses)

    # ── TEST 6: AIService Prompt Construction Injects Grounded Knowledge ──
    def test_build_dynamic_system_prompt_injects_document_knowledge(self):
        service = AIService()
        service.eresource_file_repo.get_all_active = MagicMock(return_value=self.all_files)
        service.reference_repo.search_multi_token = MagicMock(return_value=self.all_refs)
        service.reference_repo.get_all = MagicMock(return_value=self.all_refs)
        service.book_repo.search_multi_token = MagicMock(return_value=[])
        service.book_repo.get_recent = MagicMock(return_value=[])
        service.book_repo.get_oldest = MagicMock(return_value=[])
        service.reference_repo.get_recent = MagicMock(return_value=self.all_refs)
        service.reference_repo.get_oldest = MagicMock(return_value=self.all_refs)

        # 1. Agriculture handbook inquiry
        prompt1 = service._build_dynamic_system_prompt("What is in the agriculture handbook?", complexity_tier="TIER_3")
        self.assertIn("DOCUMENT & BOOK CONTENT KNOWLEDGE", prompt1)
        self.assertIn("Agriculture Handbook 2026.pdf", prompt1)
        self.assertIn("Soil Health and Nutrients", prompt1)
        self.assertIn("Drip Irrigation", prompt1)
        self.assertIn("ZERO HALLUCINATIONS", prompt1)

        # 2. Thesis findings inquiry
        prompt2 = service._build_dynamic_system_prompt("What are the findings of the thesis on organic fertilizer?", complexity_tier="TIER_3")
        self.assertIn("THESIS & RESEARCH KNOWLEDGE", prompt2)
        self.assertIn("Maria Elena Santos", prompt2)
        self.assertIn("Randomized Complete Block Design", prompt2)
        self.assertIn("26.8%", prompt2)
        self.assertIn("ZERO HALLUCINATIONS", prompt2)


    # ── TEST 7: User Picture Inquiry: Specific File Knowledge Direct Answer ──
    def test_direct_file_knowledge_inquiry_from_user_screenshot(self):
        service = AIService()
        agri_file = SimpleNamespace(
            pk=1,
            name="01.-Basic-Agriculture.-Student-Handbook.pdf",
            summary="Comprehensive instructional student handbook covering core agricultural sciences, crop cultivation, soil science, and sustainable farming systems.",
            table_of_contents="Chapter 1: Introduction to Agricultural Sciences\nChapter 2: Soil Classification & Fertility\nChapter 3: Agronomic Principles & Field Crops\nChapter 4: Integrated Pest Management",
            keywords="Agriculture, Agronomy, Soil Fertility, Crop Production, Plant Pathology, IPM",
            department=SimpleNamespace(name="AGRI", parent=SimpleNamespace(name="CAF", parent=None)),
            is_active=True,
            file="e_resources/sample.pdf",
            ocr_status="completed"
        )
        service.eresource_file_repo.get_all_active = MagicMock(return_value=[agri_file])

        query = "01.-Basic-Agriculture.-Student-Handbook.pdf whats this content all about?"
        ans = service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertIn("Executive Summary", ans)
        self.assertIn("Table of Contents / Key Chapters", ans)
        self.assertIn("Core Topics & Concepts Covered", ans)
        self.assertIn("Collection Reading Policy", ans)
        # CRITICAL: Must NEVER dump the generic 69 department folders!
        self.assertNotIn("69 Academic Department Folders", ans)
        self.assertNotIn("CAF > BIOSYSTEM ENGINEERING", ans)


    # ── TEST 8: File with unextracted/pending knowledge auto-synthesizes on the fly ──
    def test_unextracted_file_synthesizes_domain_knowledge(self):
        service = AIService()
        unextracted_file = SimpleNamespace(
            pk=99,
            name="01.-Basic-Agriculture.-Student-Handbook.pdf",
            summary=None,
            table_of_contents=None,
            keywords=None,
            department=SimpleNamespace(name="AGRI", parent=SimpleNamespace(name="CAF", parent=None)),
            is_active=True,
            file="e_resources/sample.pdf",
            ocr_status="pending",
            save=MagicMock()
        )
        service.eresource_file_repo.get_all_active = MagicMock(return_value=[unextracted_file])

        query = "01.-Basic-Agriculture.-Student-Handbook.pdf whats this content all about?"
        ans = service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertIn("Executive Summary", ans)
        self.assertIn("Table of Contents / Key Chapters", ans)
        self.assertIn("Agriculture", ans)
        self.assertNotIn("69 Academic Department Folders", ans)


    # ── TEST 9: Exact user inquiry string with spaces around punctuation ──
    def test_exact_user_inquiry_with_spaces_around_punctuation(self):
        service = AIService()
        agri_file = SimpleNamespace(
            pk=1,
            name="01.-Basic-Agriculture.-Student-Handbook.pdf",
            summary="Comprehensive instructional student handbook covering core agricultural sciences, crop cultivation, soil science, and sustainable farming systems.",
            table_of_contents="Chapter 1: Introduction to Agricultural Sciences\nChapter 2: Soil Classification & Fertility\nChapter 3: Agronomic Principles & Field Crops\nChapter 4: Integrated Pest Management",
            keywords="Agriculture, Agronomy, Soil Fertility, Crop Production, Plant Pathology, IPM",
            department=SimpleNamespace(name="AGRI", parent=SimpleNamespace(name="CAF", parent=None)),
            is_active=True,
            file="e_resources/sample.pdf",
            ocr_status="completed",
            save=MagicMock()
        )
        service.eresource_file_repo.get_all_active = MagicMock(return_value=[agri_file])

        # Exact query from user's production PC screenshot:
        query = "01 .- Basic-Agriculture .- Student-Handbook.pdf whats this content all about?"
        ans = service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertIn("Executive Summary", ans)
        self.assertIn("Table of Contents / Key Chapters", ans)
        self.assertIn("Collection Reading Policy", ans)
        # CRITICAL: Must NEVER fall through to Intent 3 or dump 69 folders!
        self.assertNotIn("69 Academic Department Folders", ans)
        self.assertNotIn("Currently 559 downloadable PDF files", ans)


    # ── TEST 10: Specific Thesis & Dissertation Research Inquiry ──
    def test_thesis_direct_knowledge_inquiry(self):
        service = AIService()
        thesis_record = SimpleNamespace(
            pk=77,
            title="IoT-Based Environmental Monitoring in Zamboanga del Norte",
            author="Juan dela Cruz, Engr.",
            department="College of Engineering and Technology",
            category="Thesis and Dissertation",
            call_number="TH-EN-2026-004",
            abstract="Continuous wireless sensor telemetry for environmental surveillance and flood risk mitigation across Katipunan river basins.",
            methodology="ESP32 LoRaWAN nodes deployed at 5 municipal checkpoints with solar recharging arrays.",
            findings_conclusion="Sensors achieved 99.4% uptime with sub-second alert transmission during peak precipitation periods.",
            access_type="file",
            access_file=SimpleNamespace(name="theses/iot_monitoring.pdf"),
            ocr_status="completed",
            save=MagicMock()
        )
        service.reference_repo.get_all = MagicMock(return_value=[thesis_record])
        service.eresource_file_repo.get_all_active = MagicMock(return_value=[])

        query = "IoT-Based Environmental Monitoring in Zamboanga del Norte whats this content all about?"
        ans = service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("IoT-Based Environmental Monitoring in Zamboanga del Norte", ans)
        self.assertIn("Research Abstract", ans)
        self.assertIn("Research Methodology", ans)
        self.assertIn("Key Findings & Conclusions", ans)
        self.assertIn("Juan dela Cruz", ans)
        self.assertIn("Catalog Access Policy", ans)
        self.assertNotIn("69 Academic Department Folders", ans)


    # ── TEST 11: Non-existent specific file inquiry returns factual document notice ──
    def test_nonexistent_specific_file_does_not_dump_folders(self):
        service = AIService()
        service.eresource_file_repo.get_all_active = MagicMock(return_value=[])
        service.reference_repo.get_all = MagicMock(return_value=[])

        query = "99.-Non-Existent-Fake-Handbook.pdf whats this content all about?"
        ans = service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("could not find a document matching that specific filename", ans)
        self.assertNotIn("CAF > BIOSYSTEM ENGINEERING", ans)


if __name__ == '__main__':
    unittest.main()

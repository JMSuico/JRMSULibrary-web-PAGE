# [Layer: Tests] — challenge_verification_suite.py
"""
Hardened Extreme Challenge Verification Suite for JRMSU Katipunan Campus Library.
Tests AI Knowledge Grounding, Query Normalization, Intent Routing, Anti-Folder-Dumping,
and Asynchronous Ingestion under stress conditions.
"""

import importlib.machinery
import os
import re
import sys
import unittest
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import MagicMock, patch

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

# ── 1. INITIALIZE CANONICAL MOCK ENVIRONMENT ──────────────────────────────
import Features.tests_knowledge_ingestion
from Features.Helpers.ai_read_view_helper import AIReadViewHelper

# ── 2. REPOSITORY & SERVICE INTERFACE MOCKS ───────────────────────────────
mock_repo = ModuleType("Features.Repositories.Implementations")
for r in [
    'PersonnelRepository', 'ManagedLinkRepository', 'PageContentRepository',
    'ManagedFileRepository', 'PageImageRepository', 'BatchRepository',
    'NewlyAcquiredBookRepository', 'ResearchReferenceRepository',
    'AIFaqRepository', 'LibraryInteriorImageRepository', 'SettingsRepository',
    'EResourceDepartmentRepository', 'EResourceFileRepository'
]:
    setattr(mock_repo, r, MagicMock)

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

mock_iface = ModuleType('Features.Services.Interfaces.i_ai_service')
mock_iface.IAIService = object
sys.modules['Features.Services'] = ModuleType('Features.Services')
sys.modules['Features.Services.Interfaces'] = ModuleType('Features.Services.Interfaces')
sys.modules['Features.Services.Interfaces.i_ai_service'] = mock_iface

helpers_mod = sys.modules.get('Features.Helpers')
if helpers_mod is None:
    helpers_mod = ModuleType('Features.Helpers')
    helpers_mod.__path__ = [str(backend_path / 'Features' / 'Helpers')]
    sys.modules['Features.Helpers'] = helpers_mod
helpers_mod.AIReadViewHelper = AIReadViewHelper
sys.modules['Features.Helpers.ai_read_view_helper'] = helpers_mod

# ── 4. LOAD AI SERVICE ───────────────────────────────────────────────────
ai_service_path = backend_path / "Features" / "Services" / "Implementations" / "ai_service.py"
ai_loader = importlib.machinery.SourceFileLoader('ai_service', str(ai_service_path))
ai_service_mod = ai_loader.load_module()
AIService = ai_service_mod.AIService

# ── 5. LOAD OCR TEXT EXTRACTOR ───────────────────────────────────────────
ocr_path = backend_path / "Features" / "Helpers" / "ocr_text_extractor.py"
ocr_loader = importlib.machinery.SourceFileLoader('ocr_text_extractor', str(ocr_path))
ocr_mod = ocr_loader.load_module()
OCRTextExtractor = ocr_mod.OCRTextExtractor


class HardenedProductionChallengeTestCase(unittest.TestCase):
    """Extreme Challenge Verification Suite for production deployment."""

    def setUp(self):
        self.service = AIService()

        self.agri_file = SimpleNamespace(
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

        self.cs_file = SimpleNamespace(
            pk=2,
            name="Data-Structures-and-Algorithms.pdf",
            summary="Rigorous academic curriculum guide on fundamental algorithms and computational complexity.",
            table_of_contents="Chapter 1: Linear Arrays & Linked Lists\nChapter 2: Binary Search Trees & Heaps\nChapter 3: Graph Traversal & Shortest Path",
            keywords="Computer Science, Algorithms, Data Structures, Asymptotic Analysis",
            department=SimpleNamespace(name="CCS", parent=None),
            is_active=True,
            file="e_resources/sample.pdf",
            ocr_status="completed",
            save=MagicMock()
        )

        self.thesis_iot = SimpleNamespace(
            pk=10,
            title="IoT-Based Environmental Monitoring in Zamboanga del Norte",
            author="Engr. Juan Dela Cruz",
            department="College of Engineering and Technology",
            category="Thesis and Dissertation",
            call_number="TH-ENG-2026-01",
            abstract="A study on LoRaWAN wireless sensor networks for flood surveillance across Katipunan river basins.",
            methodology="ESP32 LoRaWAN nodes deployed at 5 municipal checkpoints with solar arrays.",
            findings_conclusion="Sensors achieved 99.4% packet delivery with sub-second transmission during peak rainfall.",
            access_type="file",
            access_file=SimpleNamespace(name="theses/iot_monitoring.pdf"),
            ocr_status="completed",
            save=MagicMock()
        )

        self.service.eresource_file_repo.get_all_active = MagicMock(return_value=[self.agri_file, self.cs_file])
        self.service.reference_repo.get_all = MagicMock(return_value=[self.thesis_iot])
        self.service.reference_repo.get_count = MagicMock(return_value=1)
        self.service.book_repo.get_inventory_summary = MagicMock(return_value={'total': 10, 'picture_count': 5, 'named_count': 5, 'named_books': []})
        self.service._get_all_eresource_depts = MagicMock(return_value=[])

    # ── CHALLENGE 1: Spaced Dot-Dash Query from User Production PC ──────────
    def test_challenge_01_spaced_filename_query(self):
        query = "01 .- Basic-Agriculture .- Student-Handbook.pdf whats this content all about?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertIn("Executive Summary", ans)
        self.assertIn("Table of Contents", ans)
        self.assertNotIn("69 Academic Department Folders", ans)
        self.assertNotIn("CAF > BIOSYSTEM ENGINEERING", ans)

    # ── CHALLENGE 2: UPPERCASE Variation of Production Query ────────────────
    def test_challenge_02_uppercase_query(self):
        query = "01 .- BASIC-AGRICULTURE .- STUDENT-HANDBOOK.PDF WHATS THIS CONTENT ALL ABOUT?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 3: Whitespace & Tabs Edge Case ────────────────────────────
    def test_challenge_03_tabs_and_extra_spaces(self):
        query = "   01    .-   Basic-Agriculture   .-   Student-Handbook.pdf     whats this content all about?   "
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 4: Query Without Extension ────────────────────────────────
    def test_challenge_04_query_without_extension(self):
        query = "01 Basic Agriculture Student Handbook whats this content about?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("01.-Basic-Agriculture.-Student-Handbook.pdf", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 5: Chapter-Specific Inquiry ───────────────────────────────
    def test_challenge_05_chapters_inquiry(self):
        query = "Tell me the chapters in Data Structures and Algorithms.pdf"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("Data-Structures-and-Algorithms.pdf", ans)
        self.assertIn("Linear Arrays & Linked Lists", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 6: Thesis Content & Abstract Inquiry ──────────────────────
    def test_challenge_06_thesis_content_inquiry(self):
        query = "whats this content all about in IoT-Based Environmental Monitoring in Zamboanga del Norte?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("IoT-Based Environmental Monitoring", ans)
        self.assertIn("Research Abstract", ans)
        self.assertIn("Engr. Juan Dela Cruz", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 7: Thesis Methodology Inquiry ─────────────────────────────
    def test_challenge_07_thesis_methodology_inquiry(self):
        query = "What is the research methodology of IoT-Based Environmental Monitoring?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("IoT-Based Environmental Monitoring", ans)
        self.assertIn("Research Methodology", ans)
        self.assertIn("ESP32 LoRaWAN nodes", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 8: Thesis Findings Inquiry ────────────────────────────────
    def test_challenge_08_thesis_findings_inquiry(self):
        query = "What are the findings of IoT-Based Environmental Monitoring in Zamboanga del Norte?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("IoT-Based Environmental Monitoring", ans)
        self.assertIn("Key Findings & Conclusions", ans)
        self.assertIn("99.4%", ans)
        self.assertNotIn("69 Academic Department Folders", ans)

    # ── CHALLENGE 9: Non-Existent Document Handling ─────────────────────────
    def test_challenge_09_nonexistent_document_handled_cleanly(self):
        query = "999.-Non-Existent-Fake-Handbook.pdf whats this content all about?"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("could not find a document matching that specific filename", ans)
        self.assertNotIn("CAF > BIOSYSTEM ENGINEERING", ans)

    # ── CHALLENGE 10: Academic Reasoning Prompts Bypass Intent ──────────────
    def test_challenge_10_academic_reasoning_prompt_bypasses_intent(self):
        query = "how to write a literature review for my thesis"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNone(ans)

    # ── CHALLENGE 11: General Book Recommendation Uses Standard Intent ─────
    def test_challenge_11_book_recommendation_standard_catalog(self):
        query = "recommend a book on programming"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertNotIn("Executive Summary", ans)

    # ── CHALLENGE 12: General Thesis Catalog Inquiry ────────────────────────
    def test_challenge_12_thesis_catalog_listing(self):
        query = "show me research thesis references"
        ans = self.service._resolve_deterministic_database_intent(query)
        self.assertIsNotNone(ans)
        self.assertIn("Here are matching Research & Thesis Reference records", ans)

    # ── CHALLENGE 13: Reading Policy Enforcement ────────────────────────────
    def test_challenge_13_reading_policy_in_direct_answer(self):
        ans = AIReadViewHelper.format_single_document_direct_answer(self.agri_file)
        self.assertIn("Collection Reading Policy", ans)
        self.assertIn("read-only HTML5 Canvas viewer", ans)
        self.assertIn("anti-download protection", ans)

    # ── CHALLENGE 14: On-the-Fly Domain Synthesis Structure ────────────────
    def test_challenge_14_domain_synthesis_structure(self):
        synth = OCRTextExtractor.synthesize_domain_knowledge("Philippine History and Governance", "College of Arts and Sciences")
        self.assertTrue(len(synth["summary"]) > 50)
        self.assertTrue(len(synth["keywords"]) > 10)
        # Verify 6 structured chapters are generated
        for ch in ["Chapter 1:", "Chapter 2:", "Chapter 3:", "Chapter 4:", "Chapter 5:", "Chapter 6:"]:
            self.assertIn(ch, synth["table_of_contents"])

    # ── CHALLENGE 15: Unseeded Document Auto-Extraction on Query ───────────
    def test_challenge_15_unseeded_document_auto_synthesizes_on_query(self):
        unseeded_doc = SimpleNamespace(
            pk=404,
            name="Organic-Farming-Practices.pdf",
            summary="",
            table_of_contents="",
            keywords="",
            department=SimpleNamespace(name="AGRI", parent=None),
            is_active=True,
            file="e_resources/sample.pdf",
            ocr_status="pending",
            save=MagicMock()
        )
        self.service.eresource_file_repo.get_all_active = MagicMock(return_value=[unseeded_doc])

        query = "Organic-Farming-Practices.pdf whats this content all about?"
        ans = self.service._resolve_deterministic_database_intent(query)

        self.assertIsNotNone(ans)
        self.assertIn("Organic-Farming-Practices.pdf", ans)
        self.assertIn("Executive Summary", ans)
        self.assertIn("Chapter 1:", ans)
        self.assertTrue(unseeded_doc.save.called)


if __name__ == '__main__':
    unittest.main()

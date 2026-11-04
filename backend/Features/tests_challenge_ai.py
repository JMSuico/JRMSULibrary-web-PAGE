import ast
import unittest
import importlib.machinery
import re
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

sys.modules['Features'] = ModuleType('Features')
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

mock_helpers = ModuleType('Features.Helpers')
mock_helpers.AIReadViewHelper = AIReadViewHelper
sys.modules['Features.Helpers'] = mock_helpers
sys.modules['Features.Helpers.ai_read_view_helper'] = mock_helpers

ai_service_path = backend_path / "Features" / "Services" / "Implementations" / "ai_service.py"
ai_loader = importlib.machinery.SourceFileLoader('ai_service', str(ai_service_path))
ai_service_mod = ai_loader.load_module()
AIService = ai_service_mod.AIService

# ── 4. CHALLENGE HARD TEST SUITE ─────────────────────────────────────────
class ChallengeProductionAIVerification(unittest.TestCase):

    def setUp(self):
        self.service = AIService()
        self.service.get_read_view_audit_summary = MagicMock(return_value={
            "books_total": 135,
            "books_img": 135,
            "books_named": 0,
            "research_references_total": 10,
            "eresource_departments_total": 60,
            "eresource_files_total": 0,
            "managed_links_total": 23,
            "library_services_count": 17,
            "managed_files_total": 2,
            "personnel_total": 4,
            "library_images_total": 54,
            "faqs_total": 104,
            "opening_hours": "7:00 AM - 7:00 PM",
            "active_batch_name": "Batch 1 2026"
        })

    # ── CHALLENGE TEST 1: Security Boundaries & AST PII Isolation ──
    def test_01_security_boundary_ast_verification(self):
        source = ai_service_path.read_text(encoding="utf-8")
        tree = ast.parse(source, filename=str(ai_service_path))

        RESTRICTED_MODELS = {
            "Account", "ContactMessage", "ContactAttachment", "Feedback",
            "SiteVisit", "RecycleBin", "GeneratedReport", "BatchHistory"
        }
        imported_symbols = set()
        referenced_identifiers = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imported_symbols.add(alias.asname or alias.name.split(".")[-1])
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    imported_symbols.add(alias.asname or alias.name)
            elif isinstance(node, ast.Name):
                referenced_identifiers.add(node.id)
            elif isinstance(node, ast.Attribute):
                referenced_identifiers.add(node.attr)

        for restricted in RESTRICTED_MODELS:
            self.assertNotIn(restricted, imported_symbols, f"Restricted model '{restricted}' must NEVER be imported!")
            self.assertNotIn(restricted, referenced_identifiers, f"Restricted model '{restricted}' must NEVER be queried!")
            self.assertNotIn(f"{restricted}.objects", source, f"Restricted query '{restricted}.objects' found!")

    # ── CHALLENGE TEST 2: Algorithm 1 - Book & Reference Ranking ──
    def test_02_algorithm_1_ranking_and_sorting(self):
        books = [
            SimpleNamespace(title="Advanced Python Programming", author="John Doe", category="Computer Science", accession_number="CS-001"),
            SimpleNamespace(title="General Chemistry", author="Jane Smith", category="Natural Science", accession_number="NS-002"),
            SimpleNamespace(title="Database Management Systems", author="Alan Turing", category="Computer Science", accession_number="CS-003"),
        ]
        tokens = ["python", "programming"]
        ranked = AIReadViewHelper.rank_and_sort_books(books, tokens, raw_query="python programming", limit=2)
        self.assertEqual(len(ranked), 1)
        self.assertEqual(ranked[0].title, "Advanced Python Programming")

    # ── CHALLENGE TEST 3: Algorithm 2 - E-Resource Department Traversal ──
    def test_03_algorithm_2_eresource_tree_traversal(self):
        dept_root = SimpleNamespace(id=1, name="CCS", parent_id=None, parent=None)
        dept_sub = SimpleNamespace(id=2, name="BSIS", parent_id=1, parent=dept_root)
        dept_course = SimpleNamespace(id=3, name="Data Structures and Algorithms", parent_id=2, parent=dept_sub)

        depts = [dept_root, dept_sub, dept_course]
        matches = AIReadViewHelper.match_eresource_folders(depts, ["data", "structures"], raw_query="data structures")
        self.assertGreater(len(matches), 0)
        self.assertIn("CCS > BSIS > Data Structures", matches[0]["breadcrumb"])

    # ── CHALLENGE TEST 4: Algorithm 3 - 2-Floor Safety Guardrail ──
    def test_04_algorithm_3_two_floor_guardrail(self):
        for fake_floor_query in ["what is on the 3rd floor?", "books in 4th floor", "floor 5 study area"]:
            ans = self.service._resolve_deterministic_database_intent(fake_floor_query)
            self.assertIsNotNone(ans)
            self.assertIn("2-storey facility featuring the 1st Floor and 2nd Floor", ans)
            self.assertIn("There is no", ans)

    # ── CHALLENGE TEST 5: Algorithm 4 - Managed Links Classification ──
    def test_05_algorithm_4_managed_links_grouping(self):
        links = [
            SimpleNamespace(name="VitalSource", category="Acquired E-Resources", is_active=True),
            SimpleNamespace(name="Scholaar", category="Resources", is_active=True),
            SimpleNamespace(name="DOAJ", category="Open Access Journal", is_active=True),
        ]
        grouped = AIReadViewHelper.group_and_sort_managed_links(links)
        self.assertEqual(grouped["total_active"], 3)
        self.assertEqual(grouped["category_counts"]["Acquired E-Resources"], 1)
        self.assertEqual(grouped["category_counts"]["Resources"], 1)
        self.assertEqual(grouped["category_counts"]["Open Access Journal"], 1)

    # ── CHALLENGE TEST 6: Algorithm 5 - Live Database Read/View Report ──
    def test_06_algorithm_5_live_audit_report(self):
        summary = self.service.get_read_view_audit_summary()
        report = AIReadViewHelper.build_live_database_audit_report(summary)
        self.assertIn("Live Database Read/View Access Report", report)
        self.assertIn("60", report)
        self.assertIn("23", report)
        self.assertIn("135", report)

    # ── CHALLENGE TEST 7: Tagalog Database Intent (User Prompt Challenge) ──
    def test_07_tagalog_database_query_challenge(self):
        prompt = "Nakaka basa kaba ng database?"
        answer = self.service._resolve_deterministic_database_intent(prompt)
        self.assertIsNotNone(answer)
        self.assertIn("Oo! Direktang nakakonekta at nakakabasa ako sa live PostgreSQL database", answer)
        self.assertIn("135", answer)
        self.assertIn("Batch 1 2026", answer)

    # ── CHALLENGE TEST 8: Bisaya Database Intent Challenge ──
    def test_08_bisaya_database_query_challenge(self):
        prompt = "mabasa ba nimo ang database"
        answer = self.service._resolve_deterministic_database_intent(prompt)
        self.assertIsNotNone(answer)
        self.assertIn("PostgreSQL database", answer)

    # ── CHALLENGE TEST 9: Tagalog/Bisaya Language Capability Challenge ──
    def test_09_language_capability_query_challenge(self):
        for p in ["can you speak tagalog or bissaya?", "can you speak bisaya", "nakasulti kag bisaya", "marunong ka ba mag tagalog"]:
            ans = self.service._resolve_deterministic_database_intent(p)
            self.assertIsNotNone(ans)
            self.assertIn("Tagalog at Bisaya", ans)

    # ── CHALLENGE TEST 10: Adaptive 3-Tier Classifier Invariants ──
    def test_10_adaptive_3_tier_classifier(self):
        tier3, opt3, _ = self.service._classify_query_complexity("How do I formulate a methodology framework for my capstone thesis?")
        self.assertEqual(tier3, "TIER_3")
        self.assertEqual(opt3["num_predict"], 850)

        tier2, opt2, _ = self.service._classify_query_complexity("Can you recommend available books about programming?")
        self.assertEqual(tier2, "TIER_2")
        self.assertEqual(opt2["num_predict"], 550)

        tier1, opt1, _ = self.service._classify_query_complexity("What time does the library close?")
        self.assertEqual(tier1, "TIER_1")
        self.assertEqual(opt1["num_predict"], 260)

    # ── CHALLENGE TEST 11: Sentence Completion Guardrail ──
    def test_11_sentence_completion_guardrail(self):
        severed_text = "The library has comprehensive collections in the special archive. If you have any other questions related"
        trimmed = self.service._trim_incomplete_sentence(severed_text)
        self.assertTrue(trimmed.endswith("special archive."))
        self.assertNotIn("questions related", trimmed)

    # ── CHALLENGE TEST 12: Anti-Hallucination Guardrail ──
    def test_12_anti_hallucination_intercept(self):
        hallucinated_text = "I recommend you read The Art of War by Sun Tzu or Sapiens by Yuval Noah Harari."
        sanitized = self.service._sanitize_llm_output(hallucinated_text)
        self.assertNotIn("The Art of War", sanitized)
        self.assertNotIn("Sapiens", sanitized)
        self.assertIn("I am Rizal", sanitized)
        self.assertIn("Newly Acquired Book", sanitized)

if __name__ == '__main__':
    unittest.main()

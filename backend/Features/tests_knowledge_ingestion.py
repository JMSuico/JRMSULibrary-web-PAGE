# [Layer: Tests] — tests_knowledge_ingestion.py
"""
Unit test suite for the Automated Knowledge Ingestion CLI and Signal Handlers.

Verifies:
1. `extract_file_knowledge` management command:
   - `--force` and `--limit` argument handling
   - `resolve_file_on_disk` path resolution strategies
   - `extract_findings_or_conclusion` regex parsing
   - `extract_methodology` regex parsing
   - `process_single_eresource_file` updates
   - `process_single_research_reference` updates
   - End-to-end command execution and summary metrics reporting
2. `signals.py` automated post-save triggers:
   - Ingestion invocation when `ocr_status == 'pending'`
   - Guard against re-invoking when `ocr_status != 'pending'` or file is empty
   - Guard against non-file ResearchReference records
   - Thread safety and duplicate in-flight prevention
   - Safe DB connection closure in background threads
"""

from __future__ import annotations

import io
import os
import sys
import tempfile
import threading
import types
import unittest
from unittest.mock import MagicMock, call, patch

# Provide lightweight mock environment for Django if running on bare Python runtime
try:
    import django
    from django.conf import settings
    if not settings.configured:
        settings.configure(
            INSTALLED_APPS=["django.contrib.auth", "django.contrib.contenttypes", "Features"],
            DATABASES={"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
            MEDIA_ROOT="/tmp/media",
            BASE_DIR="/tmp",
            SECRET_KEY="test-key",
        )
        try:
            django.setup()
        except Exception:
            pass
except ImportError:
    # Build complete mock hierarchy for django
    django_mock = types.ModuleType("django")
    django_mock.__path__ = []
    sys.modules["django"] = django_mock

    core_mock = types.ModuleType("django.core")
    core_mock.__path__ = []
    sys.modules["django.core"] = core_mock
    django_mock.core = core_mock

    cache_mock = types.ModuleType("django.core.cache")
    cache_mock.cache = MagicMock()
    sys.modules["django.core.cache"] = cache_mock
    core_mock.cache = cache_mock

    conf_mock = types.ModuleType("django.conf")
    conf_mock.settings = MagicMock()
    sys.modules["django.conf"] = conf_mock
    django_mock.conf = conf_mock

    utils_mock = types.ModuleType("django.utils")
    import datetime
    class FakeTimezone:
        @staticmethod
        def now():
            return datetime.datetime.now(datetime.timezone.utc)
    utils_mock.timezone = FakeTimezone()
    sys.modules["django.utils"] = utils_mock
    django_mock.utils = utils_mock

    dispatch_mock = types.ModuleType("django.dispatch")
    def fake_receiver(*args, **kwargs):
        def decorator(fn):
            return fn
        return decorator
    dispatch_mock.receiver = fake_receiver
    sys.modules["django.dispatch"] = dispatch_mock
    django_mock.dispatch = dispatch_mock

    db_mock = types.ModuleType("django.db")
    db_mock.__path__ = []
    db_mock.connection = MagicMock()
    db_mock.transaction = MagicMock()
    django_mock.db = db_mock
    
    class FakeModel:
        class Meta: pass
    class FakeTextChoices:
        choices = []
    class FakeIntegerChoices:
        choices = []
    
    models_mock = MagicMock()
    models_mock.Model = FakeModel
    models_mock.TextChoices = FakeTextChoices
    models_mock.IntegerChoices = FakeIntegerChoices
    db_mock.models = models_mock
    sys.modules["django.db"] = db_mock
    sys.modules["django.db.models"] = models_mock

    signals_mock = types.ModuleType("django.db.models.signals")
    signals_mock.post_save = MagicMock()
    signals_mock.post_delete = MagicMock()
    signals_mock.pre_save = MagicMock()
    sys.modules["django.db.models.signals"] = signals_mock

    mgmt_mock = types.ModuleType("django.core.management.base")
    class FakeStyle:
        def SUCCESS(self, msg): return f"[SUCCESS] {msg}"
        def ERROR(self, msg): return f"[ERROR] {msg}"
        def WARNING(self, msg): return f"[WARNING] {msg}"
        def MIGRATE_HEADING(self, msg): return f"[HEADING] {msg}"
        def HTTP_INFO(self, msg): return f"[INFO] {msg}"

    class FakeBaseCommand:
        def __init__(self):
            self.stdout = io.StringIO()
            self.style = FakeStyle()
        def add_arguments(self, parser): pass
        def handle(self, *args, **options): pass

    mgmt_mock.BaseCommand = FakeBaseCommand
    mgmt_mock.CommandParser = MagicMock
    sys.modules["django.core.management.base"] = mgmt_mock

    auth_mock = types.ModuleType("django.contrib.auth")
    auth_models_mock = types.ModuleType("django.contrib.auth.models")
    class FakeAbstractUser: pass
    auth_models_mock.AbstractUser = FakeAbstractUser
    sys.modules["django.contrib.auth"] = auth_mock
    sys.modules["django.contrib.auth.models"] = auth_models_mock
    auth_mock.models = auth_models_mock
    auth_mock.get_user_model = lambda: FakeAbstractUser

    # Mock channels & asgiref
    for mod in ("channels", "channels.layers", "asgiref", "asgiref.sync", "celery"):
        sys.modules[mod] = MagicMock()

from Features.management.commands.extract_file_knowledge import (
    Command as ExtractKnowledgeCommand,
    extract_findings_or_conclusion,
    extract_methodology,
    process_single_eresource_file,
    process_single_research_reference,
    resolve_file_on_disk,
)
from Features.signals import (
    _IN_FLIGHT_INGESTION,
    _run_background_document_extraction,
    handle_eresource_file_post_save,
    handle_research_reference_post_save,
    trigger_background_file_extraction,
)


class KnowledgeIngestionTestCase(unittest.TestCase):
    """Test suite for CLI command and background knowledge extraction."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        _IN_FLIGHT_INGESTION.clear()

    # ----------------------------------------------------------------------
    # 1. Path Resolution Tests
    # ----------------------------------------------------------------------
    def test_resolve_file_on_disk_native_path(self) -> None:
        test_file = os.path.join(self.temp_dir.name, "book.pdf")
        with open(test_file, "w") as f:
            f.write("content")

        mock_field = MagicMock()
        mock_field.path = test_file
        mock_field.name = "book.pdf"

        resolved = resolve_file_on_disk(mock_field)
        self.assertEqual(resolved, os.path.normpath(test_file))

    def test_resolve_file_on_disk_media_root(self) -> None:
        test_file = os.path.join(self.temp_dir.name, "e_resources", "syllabus.pdf")
        os.makedirs(os.path.dirname(test_file), exist_ok=True)
        with open(test_file, "w") as f:
            f.write("content")

        mock_field = MagicMock()
        del mock_field.path
        mock_field.name = "e_resources/syllabus.pdf"

        with patch("Features.management.commands.extract_file_knowledge.settings") as mock_settings:
            mock_settings.MEDIA_ROOT = self.temp_dir.name
            mock_settings.BASE_DIR = self.temp_dir.name
            resolved = resolve_file_on_disk(mock_field)
            self.assertEqual(resolved, os.path.normpath(test_file))

    def test_resolve_file_on_disk_missing(self) -> None:
        mock_field = MagicMock()
        mock_field.path = os.path.join(self.temp_dir.name, "missing.pdf")
        mock_field.name = "missing.pdf"

        with patch("Features.management.commands.extract_file_knowledge.settings") as mock_settings:
            mock_settings.MEDIA_ROOT = self.temp_dir.name
            resolved = resolve_file_on_disk(mock_field)
            self.assertIsNone(resolved)

    # ----------------------------------------------------------------------
    # 2. Academic Regex Extraction Tests
    # ----------------------------------------------------------------------
    def test_extract_findings_or_conclusion(self) -> None:
        sample_thesis = (
            "Chapter 4: Results\n"
            "Data was analyzed using statistical tools.\n\n"
            "Findings and Conclusions:\n"
            "The proposed deep learning neural network achieved 98.4% classification accuracy "
            "across 50,000 document records. Furthermore, the caching layer reduced server response "
            "latency from 350ms to 12ms under peak load conditions.\n\n"
            "Recommendations:\n"
            "Future researchers should expand the dataset to multi-campus libraries.\n\n"
            "References:\n"
            "[1] Rizal, J. Automated Library Systems, 2026."
        )
        findings = extract_findings_or_conclusion(sample_thesis)
        self.assertIn("98.4% classification accuracy", findings)
        self.assertIn("caching layer reduced server response", findings)
        self.assertNotIn("References:", findings)

    def test_extract_methodology(self) -> None:
        sample_thesis = (
            "Introduction: Background of the research.\n\n"
            "Research Methodology:\n"
            "This study utilizes an agile development methodology combined with quantitative "
            "empirical benchmarking of response times across distributed ASGI server nodes.\n\n"
            "Results and Discussion:\n"
            "The system maintained 100% uptime."
        )
        methodology = extract_methodology(sample_thesis)
        self.assertIn("agile development methodology", methodology)
        self.assertNotIn("Results and Discussion:", methodology)

    # ----------------------------------------------------------------------
    # 3. Single Record Knowledge Extraction Tests
    # ----------------------------------------------------------------------
    def test_process_single_eresource_file_success(self) -> None:
        test_file = os.path.join(self.temp_dir.name, "book.txt")
        with open(test_file, "w", encoding="utf-8") as f:
            f.write(
                "Chapter 1: Principles of Computer Architecture\n\n"
                "Abstract: Modern RISC processors utilize pipelining and superscalar execution.\n\n"
                "Cache hierarchies minimize main memory latency."
            )

        mock_book = MagicMock()
        mock_book.pk = 101
        mock_book.name = "Computer Architecture"
        mock_book.file = MagicMock()
        mock_book.file.path = test_file
        mock_book.file.name = "book.txt"
        mock_book.extracted_text = ""
        mock_book.summary = ""
        mock_book.table_of_contents = ""
        mock_book.keywords = ""
        mock_book.ocr_status = "pending"
        mock_book.ocr_processed_at = None

        success = process_single_eresource_file(mock_book)
        self.assertTrue(success)
        self.assertEqual(mock_book.ocr_status, "completed")
        self.assertIsNotNone(mock_book.ocr_processed_at)
        self.assertIn("Principles of Computer Architecture", mock_book.table_of_contents)
        self.assertTrue(len(mock_book.extracted_text) > 0)
        self.assertTrue(mock_book.save.called)

    def test_process_single_eresource_file_file_not_found(self) -> None:
        mock_book = MagicMock()
        mock_book.pk = 102
        mock_book.file = MagicMock()
        mock_book.file.path = os.path.join(self.temp_dir.name, "nonexistent.pdf")
        mock_book.file.name = "nonexistent.pdf"
        mock_book.ocr_status = "pending"

        success = process_single_eresource_file(mock_book)
        self.assertFalse(success)
        self.assertEqual(mock_book.ocr_status, "failed")
        self.assertTrue(mock_book.save.called)

    def test_process_single_research_reference_success(self) -> None:
        test_file = os.path.join(self.temp_dir.name, "thesis.txt")
        with open(test_file, "w", encoding="utf-8") as f:
            f.write(
                "Title: IoT-Based Environmental Monitoring in Zamboanga del Norte\n\n"
                "Abstract: This thesis examines continuous sensor telemetry for disaster risk reduction.\n\n"
                "Research Methodology:\n"
                "LoRaWAN sensors and ESP32 microcontrollers were deployed across five municipal nodes.\n\n"
                "Findings and Conclusions:\n"
                "Real-time sensor arrays achieved 99.2% packet delivery with low energy consumption.\n\n"
                "References:\n"
                "1. Department of Science and Technology."
            )

        mock_thesis = MagicMock()
        mock_thesis.pk = 201
        mock_thesis.title = "IoT-Based Environmental Monitoring"
        mock_thesis.access_type = "file"
        mock_thesis.access_file = MagicMock()
        mock_thesis.access_file.path = test_file
        mock_thesis.access_file.name = "thesis.txt"
        mock_thesis.abstract = ""
        mock_thesis.methodology = ""
        mock_thesis.findings_conclusion = ""
        mock_thesis.ocr_status = "pending"
        mock_thesis.ocr_processed_at = None

        success = process_single_research_reference(mock_thesis)
        self.assertTrue(success)
        self.assertEqual(mock_thesis.ocr_status, "completed")
        self.assertIsNotNone(mock_thesis.ocr_processed_at)
        self.assertIn("LoRaWAN sensors", mock_thesis.methodology)
        self.assertIn("Real-time sensor arrays achieved 99.2%", mock_thesis.findings_conclusion)
        self.assertTrue(mock_thesis.save.called)

    def test_process_single_research_reference_skip_non_file(self) -> None:
        mock_thesis = MagicMock()
        mock_thesis.pk = 202
        mock_thesis.access_type = "link"
        mock_thesis.access_file = None
        mock_thesis.ocr_status = "pending"

        success = process_single_research_reference(mock_thesis)
        self.assertFalse(success)
        self.assertEqual(mock_thesis.ocr_status, "none")
        self.assertTrue(mock_thesis.save.called)

    # ----------------------------------------------------------------------
    # 4. Management Command Execution & Statistics
    # ----------------------------------------------------------------------
    def test_command_execution(self) -> None:
        cmd = ExtractKnowledgeCommand()
        cmd.stdout = io.StringIO()

        test_file = os.path.join(self.temp_dir.name, "book.txt")
        with open(test_file, "w", encoding="utf-8") as f:
            f.write("Chapter 1: Local Knowledge Ingestion Testing")

        mock_book = MagicMock()
        mock_book.pk = 1
        mock_book.name = "Local Book 1"
        mock_book.file = MagicMock()
        mock_book.file.path = test_file
        mock_book.file.name = "book.txt"
        mock_book.ocr_status = "pending"

        mock_thesis = MagicMock()
        mock_thesis.pk = 2
        mock_thesis.title = "Thesis 1"
        mock_thesis.access_type = "file"
        mock_thesis.access_file = MagicMock()
        mock_thesis.access_file.path = test_file
        mock_thesis.access_file.name = "book.txt"
        mock_thesis.abstract = ""
        mock_thesis.findings_conclusion = ""
        mock_thesis.methodology = ""
        mock_thesis.ocr_status = "pending"

        with patch("Features.management.commands.extract_file_knowledge.EResourceFile") as mock_eresource_cls, \
             patch("Features.management.commands.extract_file_knowledge.ResearchReference") as mock_research_cls:

            mock_eresource_cls.objects.filter.return_value.exclude.return_value = [mock_book]
            mock_research_cls.objects.filter.return_value.exclude.return_value.exclude.return_value.exclude.return_value = [mock_thesis]

            cmd.handle(force=False, limit=10)

            output = cmd.stdout.getvalue()
            self.assertIn("JRMSU KATIPUNAN CAMPUS LIBRARY - KNOWLEDGE INGESTION", output)
            self.assertIn("Processed 1 Local Books (EResourceFile)", output)
            self.assertIn("Processed 1 Theses/Dissertations (ResearchReference)", output)
            self.assertIn("Total: Processed 2 files", output)

    # ----------------------------------------------------------------------
    # 5. Signals Automated Ingestion Tests
    # ----------------------------------------------------------------------
    def test_signal_eresource_file_post_save_triggers_when_pending(self) -> None:
        mock_instance = MagicMock()
        mock_instance.pk = 77
        mock_instance.file = MagicMock()
        mock_instance.file.name = "test.pdf"
        mock_instance.ocr_status = "pending"

        with patch("Features.signals.trigger_background_file_extraction") as mock_trigger:
            handle_eresource_file_post_save(sender=None, instance=mock_instance, created=True)
            mock_trigger.assert_called_once_with("EResourceFile", 77)

    def test_signal_eresource_file_post_save_ignores_when_completed(self) -> None:
        mock_instance = MagicMock()
        mock_instance.pk = 78
        mock_instance.file = MagicMock()
        mock_instance.file.name = "test.pdf"
        mock_instance.ocr_status = "completed"

        with patch("Features.signals.trigger_background_file_extraction") as mock_trigger:
            handle_eresource_file_post_save(sender=None, instance=mock_instance, created=False)
            mock_trigger.assert_not_called()

    def test_signal_research_reference_post_save_triggers_when_file_and_pending(self) -> None:
        mock_instance = MagicMock()
        mock_instance.pk = 88
        mock_instance.access_type = "file"
        mock_instance.access_file = MagicMock()
        mock_instance.access_file.name = "thesis.pdf"
        mock_instance.ocr_status = "pending"

        with patch("Features.signals.trigger_background_file_extraction") as mock_trigger:
            handle_research_reference_post_save(sender=None, instance=mock_instance, created=True)
            mock_trigger.assert_called_once_with("ResearchReference", 88)

    def test_signal_research_reference_post_save_ignores_when_link(self) -> None:
        mock_instance = MagicMock()
        mock_instance.pk = 89
        mock_instance.access_type = "link"
        mock_instance.access_file = None
        mock_instance.ocr_status = "pending"

        with patch("Features.signals.trigger_background_file_extraction") as mock_trigger:
            handle_research_reference_post_save(sender=None, instance=mock_instance, created=False)
            mock_trigger.assert_not_called()

    def test_trigger_background_prevents_duplicate_in_flight(self) -> None:
        with patch("Features.signals.threading.Thread") as mock_thread_cls, \
             patch("django.db.transaction.on_commit", side_effect=lambda fn: fn()):

            trigger_background_file_extraction("EResourceFile", 999)
            self.assertEqual(mock_thread_cls.call_count, 1)

            # Triggering again while in-flight should NOT spawn a second thread
            trigger_background_file_extraction("EResourceFile", 999)
            self.assertEqual(mock_thread_cls.call_count, 1)

    def test_run_background_document_extraction_closes_connection(self) -> None:
        mock_connection = MagicMock()

        with patch("django.db.connection", mock_connection), \
             patch("Features.Data.Models.eresource_model.EResourceFile") as mock_eresource_cls, \
             patch("Features.management.commands.extract_file_knowledge.process_single_eresource_file") as mock_proc:

            mock_eresource_cls.objects.get.return_value = MagicMock()
            mock_proc.return_value = True

            _run_background_document_extraction("EResourceFile", 505)

            mock_proc.assert_called_once()
            mock_connection.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()

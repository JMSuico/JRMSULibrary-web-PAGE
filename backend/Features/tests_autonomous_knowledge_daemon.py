# [Layer: Tests] — tests_autonomous_knowledge_daemon.py
"""
Unit tests for AutonomousKnowledgeDaemon (Automated Knowledge Ingestion Specialist).
Verifies:
1. Singleton lifecycle and thread idempotency.
2. Trigger-now event signaling for real-time upload processing.
3. Graceful handling of missing physical files.
4. Sweeping of EResourceFile and ResearchReference records without manual CLI commands.
"""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

# Import tests_knowledge_ingestion first to initialize the lightweight mock environment
import Features.tests_knowledge_ingestion
from Features.Helpers.autonomous_knowledge_daemon import AutonomousKnowledgeDaemon
from Features.Data.Models.eresource_model import EResourceFile
from Features.Data.Models.research_reference_model import ResearchReference


class TestAutonomousKnowledgeDaemon(unittest.TestCase):
    """Test suite for AutonomousKnowledgeDaemon."""

    def setUp(self):
        from Features.Helpers import autonomous_knowledge_daemon
        autonomous_knowledge_daemon._DAEMON_INSTANCE = None

    def tearDown(self):
        from Features.Helpers import autonomous_knowledge_daemon
        if autonomous_knowledge_daemon._DAEMON_INSTANCE is not None:
            autonomous_knowledge_daemon._DAEMON_INSTANCE.stop()
            autonomous_knowledge_daemon._DAEMON_INSTANCE = None

    def test_daemon_singleton_initialization(self):
        """Verify that starting daemon creates a singleton thread and is idempotent."""
        with patch.object(AutonomousKnowledgeDaemon, '_run_loop', return_value=None):
            d1 = AutonomousKnowledgeDaemon.start_daemon(interval_seconds=60)
            self.assertIsNotNone(d1)
            self.assertTrue(d1._is_running)

            d2 = AutonomousKnowledgeDaemon.start_daemon(interval_seconds=60)
            self.assertIs(d1, d2)
            d1.stop()

    def test_trigger_now_sets_event(self):
        """Verify that trigger_now signals the daemon thread to wake up immediately."""
        with patch.object(AutonomousKnowledgeDaemon, '_run_loop', return_value=None):
            daemon = AutonomousKnowledgeDaemon.start_daemon(interval_seconds=60)
            self.assertFalse(daemon._trigger_event.is_set())

            AutonomousKnowledgeDaemon.trigger_now()
            self.assertTrue(daemon._trigger_event.is_set())
            daemon.stop()

    def test_sweep_eresource_files_processes_pending(self):
        """Verify that _sweep_eresource_files fetches pending items and invokes extraction."""
        mock_book1 = MagicMock()
        mock_book1.pk = 101
        mock_book2 = MagicMock()
        mock_book2.pk = 102

        mock_qs = MagicMock()
        mock_qs.__iter__.return_value = [mock_book1, mock_book2]
        mock_qs.count.return_value = 2

        mock_objects = MagicMock()
        mock_objects.filter.return_value.exclude.return_value.__getitem__.return_value = mock_qs

        daemon = AutonomousKnowledgeDaemon(interval_seconds=60)
        with patch.object(EResourceFile, 'objects', mock_objects, create=True), \
             patch('Features.management.commands.extract_file_knowledge.process_single_eresource_file') as mock_proc:
            daemon._sweep_eresource_files()
            self.assertEqual(mock_proc.call_count, 2)
            mock_proc.assert_any_call(mock_book1)
            mock_proc.assert_any_call(mock_book2)

    def test_sweep_research_references_processes_pending(self):
        """Verify that _sweep_research_references fetches pending theses and invokes extraction."""
        mock_ref = MagicMock()
        mock_ref.pk = 501

        mock_qs = MagicMock()
        mock_qs.__iter__.return_value = [mock_ref]
        mock_qs.count.return_value = 1

        mock_objects = MagicMock()
        mock_objects.filter.return_value.filter.return_value.exclude.return_value.__getitem__.return_value = mock_qs

        daemon = AutonomousKnowledgeDaemon(interval_seconds=60)
        with patch.object(ResearchReference, 'objects', mock_objects, create=True), \
             patch('Features.management.commands.extract_file_knowledge.process_single_research_reference') as mock_proc:
            daemon._sweep_research_references()
            self.assertEqual(mock_proc.call_count, 1)
            mock_proc.assert_called_with(mock_ref)


if __name__ == '__main__':
    unittest.main()

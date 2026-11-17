# [Layer: Features] — tests_room_and_ai_v2.py
# Red TDD Baseline for:
# 1. Canonical 6 Reservation Rooms & SiteSettings.room_availability
# 2. SettingsService & SiteSettingsSerializer partial room_availability normalization
# 3. ContactService.submit_contact() room availability enforcement
# 4. AIQueryAnalyzer topic extraction, catalog/book intent, tiering, and cache budget
# 5. AIService fast cache gate (<1.0s + topic/intent compatibility), EResourceFile grounding,
#    >=380 max_tokens across all tiers, and anti-cutoff sentence finalization.

import os
import sys
import time
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

# Ensure backend/ is importable when executed directly or via unittest discovery
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import django
from django.conf import settings

_STANDALONE_BOOTSTRAP = False
if not settings.configured:
    _STANDALONE_BOOTSTRAP = True
    settings.configure(
        DEBUG=True,
        SECRET_KEY="test-room-and-ai-v2-secret-key",
        DATABASES={
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        },
        CACHES={
            "default": {
                "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
                "LOCATION": "tests-room-and-ai-v2-locmem",
            }
        },
        INSTALLED_APPS=[
            "django.contrib.auth",
            "django.contrib.contenttypes",
            "django.contrib.sessions",
            "rest_framework",
            "Features",
        ],
        AUTH_USER_MODEL="Features.Account",
        USE_TZ=True,
        TIME_ZONE="Asia/Manila",
        DEFAULT_AUTO_FIELD="django.db.models.BigAutoField",
    )
    django.setup()
    from django.core.management import call_command

    call_command("migrate", verbosity=0)

from django.core.cache import cache
from django.db import models as django_models
from django.test import TestCase

from Features.Api.Serializers.settings_serializer import SiteSettingsSerializer
from Features.Data.Models.site_settings_model import SiteSettings
from Features.Infrastructure.AiProviders.provider_registry import LLMProviderRegistry
from Features.Services.Implementations.ai_service import AIService
from Features.Services.Implementations.contact_service import ContactService
from Features.Services.Implementations.settings_service import SettingsService
from Features.Services.Interfaces.i_llm_provider import (
    ILLMProviderStrategy,
    LLMGenerationConfig,
)


CANONICAL_RESERVATION_ROOMS = [
    "Discussion Room 1",
    "Discussion Room 2",
    "Tutorium Room 1",
    "Tutorium Room 2",
    "Multimedia Room",
    "Library ComLab (Computer Laboratory)",
]


class _FakeLLMProvider(ILLMProviderStrategy):
    """Deterministic fake LLM provider for streaming/anti-cutoff unit tests."""

    def __init__(self, chunks, provider_id="ollama"):
        self._chunks = list(chunks)
        self._provider_id = provider_id
        self.calls = []

    @property
    def provider_id(self) -> str:
        return self._provider_id

    def is_configured(self) -> bool:
        return True

    def stream_chat(self, messages, config: LLMGenerationConfig, session):
        self.calls.append((messages, config))
        for chunk in self._chunks:
            yield chunk

    def complete_chat(self, messages, config: LLMGenerationConfig, session) -> str:
        self.calls.append((messages, config))
        return "".join(self._chunks)


def _make_empty_ai_service(providers=None) -> AIService:
    """Builds an AIService with all 13 repositories safely stubbed to empty values."""
    personnel_repo = MagicMock()
    personnel_repo.get_all.return_value = []

    link_repo = MagicMock()
    link_repo.get_all_active.return_value = []

    batch_repo = MagicMock()
    batch_repo.get_display_batch.return_value = None
    batch_repo.get_current_display_batch.return_value = None
    batch_repo.get_all_batches.return_value = []

    book_repo = MagicMock()
    book_repo.get_all_active.return_value = []
    book_repo.search_multi_token.return_value = []
    book_repo.get_inventory_summary.return_value = {
        "total": 0,
        "picture_count": 0,
        "named_count": 0,
        "named_books": [],
    }

    reference_repo = MagicMock()
    reference_repo.get_all.return_value = []
    reference_repo.get_count.return_value = 0

    faq_repo = MagicMock()
    faq_repo.get_all.return_value = []

    gallery_repo = MagicMock()
    gallery_repo.get_all_active.return_value = []

    settings_repo = MagicMock()
    settings_repo.get_settings.return_value = SimpleNamespace(
        library_name="JRMSU Katipunan Library",
        address="Katipunan, Zamboanga del Norte",
        contact_email="katipunan.library@jrmsu.edu.ph",
        opening_hours_mon_fri="7:00 AM - 7:00 PM",
        opening_hours_sat="Closed",
        opening_hours_sun="Closed",
    )

    eresource_dept_repo = MagicMock()
    eresource_dept_repo.get_all.return_value = []
    eresource_dept_repo.get_all_with_parents.return_value = []

    eresource_file_repo = MagicMock()
    eresource_file_repo.get_all_active.return_value = []
    eresource_file_repo.get_all.return_value = []
    eresource_file_repo.search_active_files.return_value = []

    page_content_repo = MagicMock()
    page_content_repo.get_all.return_value = []
    page_content_repo.get_by_slug.return_value = None

    managed_file_repo = MagicMock()
    managed_file_repo.get_all_active.return_value = []

    page_image_repo = MagicMock()
    page_image_repo.get_all_active.return_value = []

    registry = LLMProviderRegistry(
        providers=providers if providers is not None else [_FakeLLMProvider(["OK."])],
        cache_backend=cache,
    )

    return AIService(
        personnel_repo=personnel_repo,
        link_repo=link_repo,
        batch_repo=batch_repo,
        book_repo=book_repo,
        reference_repo=reference_repo,
        faq_repo=faq_repo,
        gallery_repo=gallery_repo,
        settings_repo=settings_repo,
        eresource_dept_repo=eresource_dept_repo,
        eresource_file_repo=eresource_file_repo,
        page_content_repo=page_content_repo,
        managed_file_repo=managed_file_repo,
        page_image_repo=page_image_repo,
        provider_registry=registry,
    )


class TestSiteSettingsRoomAvailability(TestCase):
    def setUp(self):
        super().setUp()
        SiteSettings.objects.all().delete()

    def test_site_settings_exposes_room_availability_json_field_and_defaults_all_six_rooms_true(self):
        from Features.Data.Models import site_settings_model

        field = SiteSettings._meta.get_field("room_availability")
        self.assertIsInstance(field, django_models.JSONField)

        default_rooms = getattr(site_settings_model, "DEFAULT_RESERVATION_ROOMS", None)
        self.assertIsNotNone(
            default_rooms,
            "site_settings_model must define DEFAULT_RESERVATION_ROOMS",
        )
        if isinstance(default_rooms, dict):
            self.assertEqual(set(default_rooms.keys()), set(CANONICAL_RESERVATION_ROOMS))
            self.assertTrue(all(default_rooms[r] is True for r in CANONICAL_RESERVATION_ROOMS))
        else:
            self.assertEqual(list(default_rooms), CANONICAL_RESERVATION_ROOMS)

        svc = SettingsService()
        settings_obj = svc.get_settings()
        serialized = SiteSettingsSerializer(settings_obj).data

        self.assertIn("room_availability", serialized)
        expected = {room: True for room in CANONICAL_RESERVATION_ROOMS}
        self.assertEqual(serialized["room_availability"], expected)

    def test_partial_room_availability_update_via_service_preserves_all_six_keys(self):
        svc = SettingsService()
        updated = svc.update_settings(
            {"room_availability": {"Library ComLab (Computer Laboratory)": False}}
        )
        serialized = SiteSettingsSerializer(updated).data

        self.assertIn("room_availability", serialized)
        availability = serialized["room_availability"]
        self.assertEqual(set(availability.keys()), set(CANONICAL_RESERVATION_ROOMS))
        self.assertIs(availability["Library ComLab (Computer Laboratory)"], False)
        for room in CANONICAL_RESERVATION_ROOMS:
            if room != "Library ComLab (Computer Laboratory)":
                self.assertIs(availability[room], True)

    def test_partial_room_availability_update_via_serializer_preserves_all_six_keys(self):
        svc = SettingsService()
        settings_obj = svc.get_settings()

        serializer = SiteSettingsSerializer(
            instance=settings_obj,
            data={"room_availability": {"Library ComLab (Computer Laboratory)": False}},
            partial=True,
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        saved = serializer.save()

        out = SiteSettingsSerializer(saved).data["room_availability"]
        self.assertEqual(set(out.keys()), set(CANONICAL_RESERVATION_ROOMS))
        self.assertIs(out["Library ComLab (Computer Laboratory)"], False)
        for room in CANONICAL_RESERVATION_ROOMS:
            if room != "Library ComLab (Computer Laboratory)":
                self.assertIs(out[room], True)


class TestContactServiceRoomAvailabilityEnforcement(TestCase):
    def setUp(self):
        super().setUp()
        SiteSettings.objects.all().delete()
        SettingsService().get_settings()

    @patch("Features.Services.Implementations.contact_service.send_notification_to_library")
    @patch("Features.Services.Implementations.contact_service.is_email_domain_valid", return_value=True)
    def test_submit_contact_accepts_reservation_when_requested_room_is_available(
        self, _mock_domain, _mock_notify
    ):
        svc = ContactService()
        msg = svc.submit_contact(
            {
                "name": "Juan Dela Cruz",
                "email": "juan@jrmsu.edu.ph",
                "subject": "Reservation: Library ComLab (Computer Laboratory) - Study",
                "message": "Reserving ComLab for capstone encoding.",
                "message_type": "RESERVATION",
            }
        )
        self.assertIsNotNone(msg.pk)
        self.assertEqual(msg.message_type, "RESERVATION")

    @patch("Features.Services.Implementations.contact_service.send_notification_to_library")
    @patch("Features.Services.Implementations.contact_service.is_email_domain_valid", return_value=True)
    def test_submit_contact_rejects_reservation_when_room_in_subject_is_unavailable(
        self, _mock_domain, _mock_notify
    ):
        SettingsService().update_settings(
            {"room_availability": {"Library ComLab (Computer Laboratory)": False}}
        )
        svc = ContactService()
        with self.assertRaises(ValueError) as ctx:
            svc.submit_contact(
                {
                    "name": "Juan Dela Cruz",
                    "email": "juan@jrmsu.edu.ph",
                    "subject": "Reservation: Library ComLab (Computer Laboratory) - Study",
                    "message": "Reserving ComLab for capstone encoding.",
                    "message_type": "RESERVATION",
                }
            )
        self.assertIn("unavailable", str(ctx.exception).lower())

    @patch("Features.Services.Implementations.contact_service.send_notification_to_library")
    @patch("Features.Services.Implementations.contact_service.is_email_domain_valid", return_value=True)
    def test_submit_contact_rejects_reservation_when_room_name_field_is_unavailable(
        self, _mock_domain, _mock_notify
    ):
        SettingsService().update_settings(
            {"room_availability": {"Tutorium Room 1": False}}
        )
        svc = ContactService()
        with self.assertRaises(ValueError) as ctx:
            svc.submit_contact(
                {
                    "name": "Maria Clara",
                    "email": "maria@jrmsu.edu.ph",
                    "subject": "Room Reservation Request",
                    "room_name": "Tutorium Room 1",
                    "message": "Group study session.",
                    "message_type": "RESERVATION",
                }
            )
        self.assertIn("unavailable", str(ctx.exception).lower())


class TestAIQueryAnalyzer(unittest.TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    @staticmethod
    def _extract_attr(obj, *names, default=None):
        for name in names:
            if isinstance(obj, dict) and name in obj:
                return obj[name]
            if hasattr(obj, name):
                return getattr(obj, name)
        return default

    def test_analyze_basic_agriculture_extracts_tokens_catalog_intent_avoids_tier1_cap_and_sets_budget(self):
        from Features.Helpers.ai_query_analyzer import AIQueryAnalyzer

        analyzer = AIQueryAnalyzer()
        result = analyzer.analyze("any books about basic agriculture")

        raw_tokens = self._extract_attr(result, "topic_tokens", "tokens", default=[])
        topic_tokens = {str(t).lower() for t in raw_tokens}
        self.assertTrue(
            {"basic", "agriculture"}.issubset(topic_tokens),
            f"Expected {{'basic', 'agriculture'}} in topic tokens, got {topic_tokens}",
        )
        self.assertNotIn("any", topic_tokens)
        self.assertNotIn("about", topic_tokens)

        intent_val = str(self._extract_attr(result, "intent", default="") or "").lower()
        is_catalog = bool(
            self._extract_attr(result, "is_catalog_query", "is_book_query", default=False)
            or ("catalog" in intent_val)
            or ("book" in intent_val)
        )
        self.assertTrue(
            is_catalog,
            f"Expected catalog/book topic intent, got result={result!r}",
        )

        tier = str(self._extract_attr(result, "tier", "complexity_tier", default="") or "")
        max_tokens = self._extract_attr(result, "max_tokens", "num_predict", default=None)
        if tier:
            self.assertNotEqual(tier, "TIER_1")
        if max_tokens is not None:
            self.assertGreaterEqual(int(max_tokens), 380)

        budget_ms = self._extract_attr(result, "cache_budget_ms", default=None)
        self.assertIsNotNone(budget_ms, "AIQueryAnalyzer.analyze must set cache_budget_ms")
        self.assertGreater(budget_ms, 0)
        self.assertLessEqual(budget_ms, 1000)

    def test_ai_service_classify_query_complexity_avoids_160_token_tier1_cap(self):
        service = _make_empty_ai_service()
        tier, options, _inst = service._classify_query_complexity(
            "any books about basic agriculture"
        )
        self.assertNotEqual(tier, "TIER_1")
        self.assertGreaterEqual(int(options.get("num_predict", 0)), 380)


class TestAIServiceGroundingFastCacheAndAntiCutoff(unittest.TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_get_cached_answer_rejects_mismatched_topic_faq_hit_despite_fuzzy_similarity(self):
        service = _make_empty_ai_service()
        # High difflib ratio (~0.88) to "any books about basic agriculture", but wrong topic ("aquaculture")
        service.faq_repo.get_all.return_value = [
            SimpleNamespace(
                question="any books about basic aquaculture",
                answers=["We have Basic Aquaculture by Fish Dept."],
            )
        ]

        answer, matched_q = service._get_cached_answer(
            "any books about basic agriculture",
            seen_answers=[],
        )
        self.assertIsNone(answer)
        self.assertIsNone(matched_q)

    def test_get_cached_answer_rejects_mismatched_room_topic_despite_fuzzy_similarity(self):
        service = _make_empty_ai_service()
        # High difflib ratio (~0.97) to "how do i reserve tutorium room 1", but different room number
        service.faq_repo.get_all.return_value = [
            SimpleNamespace(
                question="how do i reserve tutorium room 2",
                answers=["Tutorium Room 2 is located near the circulation desk."],
            )
        ]

        answer, matched_q = service._get_cached_answer(
            "how do i reserve tutorium room 1",
            seen_answers=[],
        )
        self.assertIsNone(answer)
        self.assertIsNone(matched_q)

    def test_get_cached_answer_enforces_sub_1_second_budget(self):
        service = _make_empty_ai_service()

        def _slow_faq_fetch():
            time.sleep(1.05)
            return [
                SimpleNamespace(
                    question="library opening hours",
                    answers=["Monday to Friday, 7:00 AM - 7:00 PM."],
                )
            ]

        service.faq_repo.get_all.side_effect = _slow_faq_fetch

        answer, matched_q = service._get_cached_answer(
            "library opening hours",
            seen_answers=[],
        )
        self.assertIsNone(answer)
        self.assertIsNone(matched_q)

    def test_generate_chat_stream_grounds_basic_agriculture_in_active_eresource_file_no_hallucination(self):
        hallucinating_provider = _FakeLLMProvider(
            ["You can read Principles of Agriculture by John E. Smith."]
        )
        service = _make_empty_ai_service(providers=[hallucinating_provider])

        dept = SimpleNamespace(
            id=1,
            pk=1,
            name="College of Agriculture and Forestry",
            parent=None,
            order=1,
        )
        agri_file = SimpleNamespace(
            id=101,
            pk=101,
            name="01.-Basic-Agriculture.-Student-Handbook-author-Shiksha-Kendra.pdf",
            file="e_resources/01.-Basic-Agriculture.-Student-Handbook-author-Shiksha-Kendra.pdf",
            is_active=True,
            department=dept,
            summary="Student handbook covering soil fertility, crop production, and farm mechanization.",
            table_of_contents="Chapter 1: Soil Fertility\nChapter 2: Crop Production",
            keywords="basic agriculture, student handbook, shiksha kendra, farming",
            extracted_text="Basic Agriculture Student Handbook by Shiksha Kendra.",
            ocr_status="completed",
        )
        service.eresource_dept_repo.get_all.return_value = [dept]
        service.eresource_dept_repo.get_all_with_parents.return_value = [dept]
        service.eresource_file_repo.get_all_active.return_value = [agri_file]
        service.eresource_file_repo.get_all.return_value = [agri_file]
        service.eresource_file_repo.search_active_files.return_value = [agri_file]

        full_response = "".join(
            service.generate_chat_stream("any books about basic agriculture")
        ).strip()

        self.assertTrue(full_response)
        self.assertIn("basic agriculture", full_response.lower())
        self.assertIn("shiksha", full_response.lower())
        self.assertNotIn("john e. smith", full_response.lower())
        self.assertTrue(
            full_response.endswith((".", "!", "?", ")")),
            f"Expected response to end cleanly on a complete sentence, got: {full_response!r}",
        )

    def test_all_tier_generation_configs_have_max_tokens_at_least_380(self):
        service = _make_empty_ai_service()
        for tier in ("TIER_1", "TIER_2", "TIER_3"):
            opts = service._get_ollama_options(tier)
            config = service._build_llm_generation_config(opts)
            self.assertGreaterEqual(
                config.max_tokens,
                380,
                f"Expected {tier} max_tokens >= 380, got {config.max_tokens}",
            )

    def test_generate_chat_stream_finalizes_single_mid_sentence_stream_cleanly(self):
        mid_sentence_provider = _FakeLLMProvider(
            [
                "Basic agriculture covers soil fertility, ",
                "crop production, and farm mechanization",
            ]
        )
        service = _make_empty_ai_service(providers=[mid_sentence_provider])

        full_response = "".join(
            service.generate_chat_stream(
                "explain how soil fertility affects crop yield in sustainable farming"
            )
        ).strip()

        self.assertTrue(full_response)
        self.assertTrue(
            full_response.endswith((".", "!", "?", ")")),
            f"Expected finalized response ending on sentence boundary, got: {full_response!r}",
        )

    def test_generate_chat_stream_finalizes_trailing_fragment_after_complete_sentence_cleanly(self):
        dangling_provider = _FakeLLMProvider(
            [
                "Soil fertility supports healthy crop growth. ",
                "Basic agriculture covers soil fertility, crop production, and farm mechanization",
            ]
        )
        service = _make_empty_ai_service(providers=[dangling_provider])

        full_response = "".join(
            service.generate_chat_stream(
                "explain how soil fertility affects crop yield in sustainable farming"
            )
        ).strip()

        self.assertTrue(full_response)
        self.assertIn("Soil fertility supports healthy crop growth.", full_response)
        self.assertTrue(
            full_response.endswith((".", "!", "?", ")")),
            f"Expected no dangling trailing fragment, got: {full_response!r}",
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)

# [Layer: Tests] -- tests_batch_concurrency_and_health.py
from io import BytesIO
import os
import tempfile
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import DatabaseError, connection
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from Features.Data.Enums.batch_status import BatchStatus
from Features.Data.Models import AcquisitionBatch, NewlyAcquiredBook
from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
from Features.Services.Implementations.batch_service import BatchService
from Features.Services.Implementations.health_service import HealthService
from Features.signals import update_global_timestamp


def _make_png_upload(filename: str = "cover.png", color: tuple[int, int, int] = (20, 90, 180)) -> SimpleUploadedFile:
    buf = BytesIO()
    img = Image.new("RGB", (64, 96), color=color)
    img.save(buf, format="PNG")
    buf.seek(0)
    return SimpleUploadedFile(filename, buf.read(), content_type="image/png")


class TestHealthEndpointAndService(TestCase):
    def test_health_service_reports_unhealthy_without_leaking_exception_details(self):
        repo = MagicMock()
        repo.check_database_connection.side_effect = DatabaseError("password secret internal traceback")

        service = HealthService(repo=repo)
        payload = service.get_readiness_status()

        self.assertEqual(payload, {"status": "unhealthy", "database": "error"})

    def test_health_api_returns_200_when_db_ok_and_503_when_db_fails(self):
        client = APIClient()
        ok_response = client.get("/api/health/")
        self.assertEqual(ok_response.status_code, status.HTTP_200_OK)
        self.assertEqual(ok_response.data["status"], "healthy")
        self.assertEqual(ok_response.data["database"], "ok")

        with patch(
            "Features.Services.Implementations.health_service.HealthRepository.check_database_connection",
            side_effect=DatabaseError("db down"),
        ):
            fail_response = client.get("/api/health/")
        self.assertEqual(fail_response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(fail_response.data["status"], "unhealthy")


class TestBatchServiceConcurrencyAndMediaCleanup(TestCase):
    def test_update_book_prepares_images_outside_atomic_block(self):
        batch = AcquisitionBatch.objects.create(
            name="Concurrency Batch",
            status=BatchStatus.OPEN,
            is_display_batch=True,
        )
        book = NewlyAcquiredBook.objects.create(
            batch=batch,
            title="Initial Title",
            author="Author One",
            category="Computer Science",
        )
        service = BatchService()
        observed_in_atomic = []

        original_prepare = BatchService._prepare_cover_files

        def spying_prepare(files):
            observed_in_atomic.append(connection.in_atomic_block)
            return original_prepare(files)

        upload = _make_png_upload("updated_cover.png")
        with patch.object(BatchService, "_prepare_cover_files", side_effect=spying_prepare):
            with patch(
                "Features.Helpers.image_optimizer_helper.ImageOptimizerHelper.ensure_thumbnail_for_field",
                side_effect=RuntimeError("simulated non-fatal thumbnail error"),
            ):
                updated = service.update_book_in_batch(
                    batch.id,
                    book.id,
                    {"title": "Updated Concurrent Title"},
                    {"cover_image": upload},
                    user_id=None,
                )

        self.assertIsNotNone(updated)
        self.assertEqual(updated.title, "Updated Concurrent Title")
        # _prepare_cover_files must run BEFORE entering transaction.atomic()
        self.assertEqual(observed_in_atomic, [False])

    def test_book_repository_cleans_up_replaced_cover_and_thumbnail_after_commit(self):
        with tempfile.TemporaryDirectory() as tmp_media:
            with override_settings(MEDIA_ROOT=tmp_media, USE_S3_STORAGE=False):
                batch = AcquisitionBatch.objects.create(
                    name="Cleanup Batch",
                    status=BatchStatus.OPEN,
                    is_display_batch=True,
                )
                repo = NewlyAcquiredBookRepository()
                first_upload = _make_png_upload("first_cover.png", (10, 20, 30))
                with self.captureOnCommitCallbacks(execute=True):
                    book = repo.create(
                        {
                            "batch_id": batch.id,
                            "title": "Cleanup Book",
                            "author": "Tester",
                            "category": "Science",
                        },
                        {"cover_image": first_upload},
                    )

                old_path = book.cover_image.path
                old_stem, _ = os.path.splitext(old_path)
                old_thumb = f"{old_stem}_thumb.webp"
                with open(old_thumb, "wb") as fp:
                    fp.write(b"fake-thumb")
                self.assertTrue(os.path.isfile(old_path))
                self.assertTrue(os.path.isfile(old_thumb))

                second_upload = _make_png_upload("second_cover.png", (90, 80, 70))
                with self.captureOnCommitCallbacks(execute=True):
                    updated = repo.update(
                        book.id,
                        {"title": "Cleanup Book Revised"},
                        {"cover_image": second_upload},
                    )

                self.assertIsNotNone(updated)
                self.assertFalse(os.path.isfile(old_path))
                self.assertFalse(os.path.isfile(old_thumb))
                self.assertTrue(os.path.isfile(updated.cover_image.path))


class TestGlobalSignalDeferral(TestCase):
    def test_update_global_timestamp_schedules_on_commit_not_inline(self):
        fake_sender = SimpleNamespace(_meta=SimpleNamespace(app_label="Features"), __name__="NewlyAcquiredBook")
        excluded_sender = SimpleNamespace(_meta=SimpleNamespace(app_label="Features"), __name__="SiteSettings")

        with patch("Features.signals.transaction.on_commit") as mock_on_commit:
            update_global_timestamp(excluded_sender)
            mock_on_commit.assert_not_called()

            update_global_timestamp(fake_sender)
            mock_on_commit.assert_called_once()

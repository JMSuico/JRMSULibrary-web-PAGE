# [Layer: Tests] -- tests_personnel.py
from io import BytesIO
import os
import tempfile
import time
from unittest.mock import patch

from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import models
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from Features.Api.Serializers.personnel_serializer import PersonnelSerializer
from Features.Data.Models import Personnel
from Features.Repositories.Implementations import personnel_repository as personnel_repo_module
from Features.Repositories.Implementations.personnel_repository import PersonnelRepository

EXPECTED_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0'
EXPECTED_SERIALIZER_FIELDS = [
    'id',
    'name',
    'title',
    'photo',
    'photo_version',
    'order',
    'updated_at',
]


def _make_png_upload(filename='maam_kiaras.png', color=(16, 48, 96)):
    buffer = BytesIO()
    image = Image.new('RGB', (8, 8), color=color)
    image.save(buffer, format='PNG')
    return SimpleUploadedFile(filename, buffer.getvalue(), content_type='image/png')


def _thumb_sidecar_path(image_path):
    stem, _ = os.path.splitext(image_path)
    return f'{stem}_thumb.webp'


class TestPersonnelModelAndSerializer(TestCase):
    def setUp(self):
        self._temp_media = tempfile.TemporaryDirectory()
        self.addCleanup(self._temp_media.cleanup)
        media_override = override_settings(
            MEDIA_ROOT=self._temp_media.name,
            USE_S3_STORAGE=False,
        )
        media_override.enable()
        self.addCleanup(media_override.disable)

    def test_personnel_model_has_auto_now_updated_at_field(self):
        updated_at_field = Personnel._meta.get_field('updated_at')
        self.assertIsInstance(updated_at_field, models.DateTimeField)
        self.assertTrue(updated_at_field.auto_now)

        person = Personnel.objects.create(
            name='Kiara Keren M. Alavanza',
            title='Campus Librarian',
            order=1,
        )
        self.assertIsNotNone(person.updated_at)
        initial_updated_at = person.updated_at

        time.sleep(0.02)
        person.title = 'Chief Campus Librarian'
        person.save()
        person.refresh_from_db()
        self.assertGreater(person.updated_at, initial_updated_at)

    def test_serializer_exposes_locked_fields_and_fallback_photo_version(self):
        self.assertEqual(list(PersonnelSerializer.Meta.fields), EXPECTED_SERIALIZER_FIELDS)

        unsaved_fallback = Personnel(
            name='Kiara Keren M. Alavanza',
            title='Campus Librarian',
            order=1,
        )
        unsaved_data = PersonnelSerializer(unsaved_fallback).data
        self.assertEqual(list(unsaved_data.keys()), EXPECTED_SERIALIZER_FIELDS)
        self.assertIsNone(unsaved_data['photo'])
        self.assertEqual(unsaved_data['photo_version'], '0')
        self.assertIsNone(unsaved_data['updated_at'])

        saved_no_photo = Personnel.objects.create(
            name='Staff Without Photo',
            title='Library Staff',
            order=2,
        )
        saved_data = PersonnelSerializer(saved_no_photo).data
        self.assertIsNone(saved_data['photo'])
        self.assertTrue(saved_data['photo_version'].isdigit())
        self.assertGreater(int(saved_data['photo_version']), 0)

    def test_serializer_appends_epoch_ms_cache_buster_and_updates_on_photo_replace(self):
        person = Personnel.objects.create(
            name='Kiara Keren M. Alavanza',
            title='Campus Librarian',
            order=1,
            photo=_make_png_upload('maam_kiaras.png', (10, 20, 30)),
        )
        first_data = PersonnelSerializer(person).data
        self.assertIsNotNone(first_data['photo'])
        self.assertTrue(first_data['photo_version'].isdigit())
        self.assertTrue(
            first_data['photo'].endswith(f"?v={first_data['photo_version']}"),
            f"Expected cache-busted URL ending with ?v={first_data['photo_version']}, got {first_data['photo']}",
        )
        expected_first_ms = int(person.updated_at.timestamp() * 1000)
        self.assertLessEqual(abs(int(first_data['photo_version']) - expected_first_ms), 1)

        time.sleep(0.02)
        updated = PersonnelRepository().update(
            person.id,
            {'photo': _make_png_upload('maam_kiaras.png', (200, 100, 50))},
        )
        self.assertIsNotNone(updated)
        updated.refresh_from_db()

        second_data = PersonnelSerializer(updated).data
        self.assertIsNotNone(second_data['photo'])
        self.assertTrue(second_data['photo_version'].isdigit())
        self.assertGreater(int(second_data['photo_version']), int(first_data['photo_version']))
        self.assertTrue(second_data['photo'].endswith(f"?v={second_data['photo_version']}"))
        self.assertNotEqual(second_data['photo'], first_data['photo'])


class TestPersonnelRepositoryPersistenceAndCleanup(TestCase):
    def setUp(self):
        self._temp_media = tempfile.TemporaryDirectory()
        self.addCleanup(self._temp_media.cleanup)
        media_override = override_settings(
            MEDIA_ROOT=self._temp_media.name,
            USE_S3_STORAGE=False,
        )
        media_override.enable()
        self.addCleanup(media_override.disable)
        # Clear default Personnel rows seeded by migration 0039 so repository assertions stay isolated
        Personnel.objects.all().delete()
        self.repo = PersonnelRepository()

    def test_get_all_returns_fallback_only_when_database_is_completely_empty(self):
        empty_rows = self.repo.get_all()
        self.assertEqual(len(empty_rows), 1)
        self.assertIsNone(empty_rows[0].pk)
        self.assertEqual(empty_rows[0].name, 'Kiara Keren M. Alavanza')
        self.assertEqual(empty_rows[0].title, 'Campus Librarian')
        self.assertEqual(empty_rows[0].order, 1)

        existing = Personnel.objects.create(
            name='Dr. Head Librarian',
            title='Chief Librarian',
            order=5,
        )
        rows = self.repo.get_all()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0].pk, existing.pk)
        self.assertEqual(rows[0].name, 'Dr. Head Librarian')

    def test_get_all_orders_by_order_then_id_and_respects_max_personnel_rows(self):
        row_order2_first = Personnel.objects.create(name='Second A', title='Staff', order=2)
        row_order2_second = Personnel.objects.create(name='Second B', title='Staff', order=2)
        row_order1 = Personnel.objects.create(name='First Chief', title='Chief', order=1)

        ordered = self.repo.get_all()
        self.assertEqual(
            [row.pk for row in ordered],
            [row_order1.pk, row_order2_first.pk, row_order2_second.pk],
        )

        self.assertGreater(personnel_repo_module.MAX_PERSONNEL_ROWS, 0)
        with patch.object(personnel_repo_module, 'MAX_PERSONNEL_ROWS', 2):
            bounded = self.repo.get_all()
            self.assertEqual([row.pk for row in bounded], [row_order1.pk, row_order2_first.pk])

    def test_update_replaces_photo_and_deletes_old_file_and_thumb_sidecar(self):
        person = Personnel.objects.create(
            name='Kiara Keren M. Alavanza',
            title='Campus Librarian',
            order=1,
            photo=_make_png_upload('maam_kiaras.png', (12, 24, 36)),
        )
        old_path = os.path.realpath(person.photo.path)
        self.assertTrue(os.path.isfile(old_path))

        old_thumb = _thumb_sidecar_path(old_path)
        with open(old_thumb, 'wb') as fh:
            fh.write(b'RIFFxxxxWEBP')
        self.assertTrue(os.path.isfile(old_thumb))

        updated = self.repo.update(
            person.id,
            {'photo': _make_png_upload('maam_kiaras.png', (210, 120, 45))},
        )
        self.assertIsNotNone(updated)
        new_path = os.path.realpath(updated.photo.path)

        self.assertNotEqual(new_path, old_path)
        self.assertTrue(os.path.isfile(new_path))
        self.assertFalse(os.path.exists(old_path))
        self.assertFalse(os.path.exists(old_thumb))

    def test_update_clearing_photo_deletes_previous_file_and_thumb_sidecar(self):
        person = Personnel.objects.create(
            name='Librarian Clear Test',
            title='Staff',
            order=2,
            photo=_make_png_upload('clear_target.png', (40, 80, 120)),
        )
        old_path = os.path.realpath(person.photo.path)
        old_thumb = _thumb_sidecar_path(old_path)
        with open(old_thumb, 'wb') as fh:
            fh.write(b'RIFFxxxxWEBP')

        updated = self.repo.update(person.id, {'photo': None})
        self.assertIsNotNone(updated)
        updated.refresh_from_db()

        self.assertFalse(bool(updated.photo))
        self.assertFalse(os.path.exists(old_path))
        self.assertFalse(os.path.exists(old_thumb))

    def test_update_non_photo_field_preserves_existing_photo_and_thumb_sidecar(self):
        person = Personnel.objects.create(
            name='Original Name',
            title='Original Title',
            order=1,
            photo=_make_png_upload('keep_me.png', (50, 100, 150)),
        )
        photo_path = os.path.realpath(person.photo.path)
        thumb_path = _thumb_sidecar_path(photo_path)
        with open(thumb_path, 'wb') as fh:
            fh.write(b'RIFFxxxxWEBP')

        updated = self.repo.update(
            person.id,
            {'name': 'Updated Name', 'title': 'Updated Title'},
        )
        self.assertIsNotNone(updated)
        self.assertEqual(updated.name, 'Updated Name')
        self.assertEqual(updated.title, 'Updated Title')
        self.assertTrue(os.path.isfile(photo_path))
        self.assertTrue(os.path.isfile(thumb_path))

    def test_update_path_traversal_guard_never_deletes_outside_media_root(self):
        with tempfile.TemporaryDirectory() as outside_dir:
            outside_file = os.path.realpath(os.path.join(outside_dir, 'outside_secret.png'))
            outside_thumb = _thumb_sidecar_path(outside_file)
            with open(outside_file, 'wb') as fh:
                fh.write(b'outside-data')
            with open(outside_thumb, 'wb') as fh:
                fh.write(b'outside-thumb')

            person = Personnel.objects.create(
                name='Traversal Test',
                title='Staff',
                order=3,
            )
            rel_escape = os.path.relpath(outside_file, self._temp_media.name)
            Personnel.objects.filter(pk=person.pk).update(photo=rel_escape)

            updated = self.repo.update(
                person.id,
                {'photo': _make_png_upload('safe_replacement.png', (9, 9, 9))},
            )
            self.assertIsNotNone(updated)
            self.assertTrue(os.path.isfile(outside_file))
            self.assertTrue(os.path.isfile(outside_thumb))

    def test_update_missing_personnel_returns_none(self):
        self.assertIsNone(self.repo.update(999999, {'name': 'Missing'}))


class TestPersonnelAPIEndpointsAndCacheHeaders(TestCase):
    def setUp(self):
        self._temp_media = tempfile.TemporaryDirectory()
        self.addCleanup(self._temp_media.cleanup)
        media_override = override_settings(
            MEDIA_ROOT=self._temp_media.name,
            USE_S3_STORAGE=False,
        )
        media_override.enable()
        self.addCleanup(media_override.disable)

        User = get_user_model()
        self.admin = User.objects.create_user(
            username='personnel_librarian',
            email='personnel_librarian@jrmsu.edu.ph',
            password='StrongPassword123!',
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)
        self.anon_client = APIClient()
        # Clear default Personnel rows seeded by migration 0039 so list count assertions stay deterministic
        Personnel.objects.all().delete()

    def test_unauthenticated_write_requests_rejected_and_read_allowed(self):
        list_resp = self.anon_client.get('/api/personnel/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)

        for method_fn in (
            lambda: self.anon_client.post('/api/personnel/', {'name': 'Anon', 'title': 'Staff'}, format='json'),
            lambda: self.anon_client.patch('/api/personnel/1/', {'name': 'Anon'}, format='json'),
            lambda: self.anon_client.delete('/api/personnel/1/'),
        ):
            resp = method_fn()
            self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_list_and_retrieve_set_strict_no_cache_headers(self):
        person = Personnel.objects.create(
            name='Kiara Keren M. Alavanza',
            title='Campus Librarian',
            order=1,
            photo=_make_png_upload('maam_kiaras.png', (33, 66, 99)),
        )

        list_resp = self.anon_client.get('/api/personnel/')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(list_resp.get('Cache-Control'), EXPECTED_CACHE_CONTROL)
        self.assertEqual(len(list_resp.data), 1)
        self.assertEqual(list(list_resp.data[0].keys()), EXPECTED_SERIALIZER_FIELDS)

        detail_resp = self.anon_client.get(f'/api/personnel/{person.id}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_resp.get('Cache-Control'), EXPECTED_CACHE_CONTROL)
        self.assertEqual(list(detail_resp.data.keys()), EXPECTED_SERIALIZER_FIELDS)

        missing_resp = self.anon_client.get('/api/personnel/999999/')
        self.assertEqual(missing_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_api_create_and_patch_photo_updates_cache_buster_and_cleans_stale_file(self):
        create_resp = self.client.post(
            '/api/personnel/',
            {
                'name': 'Kiara Keren M. Alavanza',
                'title': 'Campus Librarian',
                'order': 1,
                'photo': _make_png_upload('maam_kiaras.png', (30, 60, 90)),
            },
            format='multipart',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        person_id = create_resp.data['id']
        first_version = create_resp.data['photo_version']
        self.assertTrue(first_version.isdigit())
        self.assertTrue(create_resp.data['photo'].endswith(f'?v={first_version}'))

        created_obj = Personnel.objects.get(pk=person_id)
        old_path = os.path.realpath(created_obj.photo.path)
        old_thumb = _thumb_sidecar_path(old_path)
        with open(old_thumb, 'wb') as fh:
            fh.write(b'RIFFxxxxWEBP')

        time.sleep(0.02)
        patch_resp = self.client.patch(
            f'/api/personnel/{person_id}/',
            {'photo': _make_png_upload('maam_kiaras.png', (120, 150, 180))},
            format='multipart',
        )
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        second_version = patch_resp.data['photo_version']
        self.assertTrue(second_version.isdigit())
        self.assertGreater(int(second_version), int(first_version))
        self.assertTrue(patch_resp.data['photo'].endswith(f'?v={second_version}'))
        self.assertNotEqual(patch_resp.data['photo'], create_resp.data['photo'])

        self.assertFalse(os.path.exists(old_path))
        self.assertFalse(os.path.exists(old_thumb))

        get_resp = self.anon_client.get(f'/api/personnel/{person_id}/')
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.get('Cache-Control'), EXPECTED_CACHE_CONTROL)
        self.assertEqual(get_resp.data['photo'], patch_resp.data['photo'])
        self.assertEqual(get_resp.data['photo_version'], second_version)

    def test_api_patch_clear_photo_removes_file_and_sets_photo_none(self):
        create_resp = self.client.post(
            '/api/personnel/',
            {
                'name': 'Clearable Staff',
                'title': 'Librarian',
                'order': 2,
                'photo': _make_png_upload('staff_photo.png', (70, 80, 90)),
            },
            format='multipart',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        person_id = create_resp.data['id']
        old_path = os.path.realpath(Personnel.objects.get(pk=person_id).photo.path)
        self.assertTrue(os.path.isfile(old_path))

        clear_resp = self.client.patch(
            f'/api/personnel/{person_id}/',
            {'photo': None},
            format='json',
        )
        self.assertEqual(clear_resp.status_code, status.HTTP_200_OK)
        self.assertIsNone(clear_resp.data['photo'])
        self.assertFalse(os.path.exists(old_path))

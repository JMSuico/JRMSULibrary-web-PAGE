# [Layer: Tests] — tests_book_categories.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from Features.Data.Models import (
    AcquisitionBatch,
    BookCategory,
    NewlyAcquiredBook,
    RecycleBin,
)


class TestBookCategoryAPIAndService(TestCase):
    def setUp(self):
        User = get_user_model()
        self.admin = User.objects.create_user(
            username='cat_librarian',
            email='cat_librarian@jrmsu.edu.ph',
            password='StrongPassword123!',
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_unauthenticated_requests_are_rejected(self):
        anon = APIClient()
        for method_fn in (
            lambda: anon.get('/api/batches/categories/'),
            lambda: anon.post('/api/batches/categories/', {'name': 'Math'}, format='json'),
            lambda: anon.patch('/api/batches/categories/1/', {'name': 'Math'}, format='json'),
            lambda: anon.delete('/api/batches/categories/1/'),
        ):
            resp = method_fn()
            self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_create_sanitize_duplicate_and_whitespace_guards(self):
        resp = self.client.post(
            '/api/batches/categories/',
            {'name': '  <script>alert(1)</script>Science & AI  '},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'alert(1)Science & AI')

        dup_resp = self.client.post(
            '/api/batches/categories/',
            {'name': 'alert(1)science & ai'},
            format='json',
        )
        self.assertEqual(dup_resp.status_code, status.HTTP_400_BAD_REQUEST)

        empty_resp = self.client.post(
            '/api/batches/categories/',
            {'name': '   <p></p>  '},
            format='json',
        )
        self.assertEqual(empty_resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rename_category_syncs_newly_acquired_books_atomically(self):
        cat_resp = self.client.post('/api/batches/categories/', {'name': 'Information Tech'}, format='json')
        self.assertEqual(cat_resp.status_code, status.HTTP_201_CREATED)
        cat_id = cat_resp.data['id']

        batch = AcquisitionBatch.objects.create(name='Batch Rename Test', status='open', is_display_batch=True)
        book = NewlyAcquiredBook.objects.create(
            batch=batch,
            title='Clean Systems',
            author='Ada Lovelace',
            accession_number='ACC-9001',
            category='Information Tech',
        )

        other_resp = self.client.post('/api/batches/categories/', {'name': 'Filipiniana'}, format='json')
        self.assertEqual(other_resp.status_code, status.HTTP_201_CREATED)

        # Case-insensitive collision must fail cleanly
        conflict = self.client.patch(
            f'/api/batches/categories/{cat_id}/',
            {'name': 'filipiniana'},
            format='json',
        )
        self.assertEqual(conflict.status_code, status.HTTP_400_BAD_REQUEST)

        rename_resp = self.client.patch(
            f'/api/batches/categories/{cat_id}/',
            {'name': 'Computing & IT'},
            format='json',
        )
        self.assertEqual(rename_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(rename_resp.data['name'], 'Computing & IT')

        book.refresh_from_db()
        self.assertEqual(book.category, 'Computing & IT')

    def test_delete_category_is_permanent_and_bypasses_recycle_bin(self):
        cat_resp = self.client.post('/api/batches/categories/', {'name': 'Temporary Cat'}, format='json')
        self.assertEqual(cat_resp.status_code, status.HTTP_201_CREATED)
        cat_id = cat_resp.data['id']

        recycle_before = RecycleBin.objects.count()
        del_resp = self.client.delete(f'/api/batches/categories/{cat_id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(BookCategory.objects.filter(id=cat_id).exists())
        self.assertEqual(RecycleBin.objects.count(), recycle_before)

        second_del = self.client.delete(f'/api/batches/categories/{cat_id}/')
        self.assertEqual(second_del.status_code, status.HTTP_404_NOT_FOUND)

    def test_adversarial_inputs_boundaries_unicode_and_self_case_rename(self):
        # Exact 100-char limit succeeds, 101 fails
        exact_100 = 'C' * 100
        ok_100 = self.client.post('/api/batches/categories/', {'name': exact_100}, format='json')
        self.assertEqual(ok_100.status_code, status.HTTP_201_CREATED)

        too_long = self.client.post('/api/batches/categories/', {'name': 'C' * 101}, format='json')
        self.assertEqual(too_long.status_code, status.HTTP_400_BAD_REQUEST)

        # Case-only self-rename succeeds without false conflict
        cat_id = ok_100.data['id']
        self_rename = self.client.patch(
            f'/api/batches/categories/{cat_id}/',
            {'name': 'c' * 100},
            format='json',
        )
        self.assertEqual(self_rename.status_code, status.HTTP_200_OK)

        # Unicode and regex metacharacters preserved cleanly without error
        special = '[Sci-Fi] (Edition * \\) — Filipiniana'
        special_resp = self.client.post('/api/batches/categories/', {'name': special}, format='json')
        self.assertEqual(special_resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(special_resp.data['name'], special)

        # Non-dict JSON payloads must return 400 rather than crashing with 500
        list_post = self.client.post('/api/batches/categories/', ['bad-array'], format='json')
        self.assertEqual(list_post.status_code, status.HTTP_400_BAD_REQUEST)

        list_patch = self.client.patch(f'/api/batches/categories/{cat_id}/', ['bad-array'], format='json')
        self.assertEqual(list_patch.status_code, status.HTTP_400_BAD_REQUEST)

        # Non-existent category rename returns 404
        missing_patch = self.client.patch('/api/batches/categories/999999/', {'name': 'New Name'}, format='json')
        self.assertEqual(missing_patch.status_code, status.HTTP_404_NOT_FOUND)

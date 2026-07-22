from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from Features.Services.Implementations.reference_service import ResearchReferenceService
from Features.Services.Implementations.tasks import (
    process_sync_chunk_task, 
    process_bulk_import_task, 
    process_bulk_delete_task
)


class ResearchReferenceViewSet(viewsets.ViewSet):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ResearchReferenceService()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        query = request.query_params.get('search', None)
        category = request.query_params.get('category', None)
        department = request.query_params.get('department', None)

        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 50))

        all_data = self.service.get_all_references(request=request, query=query, category=category, department=department)

        # Manual slicing for pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_data = all_data[start_idx:end_idx]

        return Response({
            'count': len(all_data),
            'total_pages': (len(all_data) + limit - 1) // limit,
            'current_page': page,
            'results': paginated_data
        }, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        data = self.service.get_reference_by_id(pk, request=request)
        if data:
            return Response(data, status=status.HTTP_200_OK)
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        success, result = self.service.create_reference(request.data, request=request)
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        success, result = self.service.update_reference(pk, request.data, request=request)
        if success:
            return Response(result, status=status.HTTP_200_OK)
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        success, result = self.service.delete_reference(pk, request=request)
        if success:
            return Response({'detail': result}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': result}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='bulk-delete', permission_classes=[IsAuthenticated])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response({'detail': 'Expected a non-empty array of ids.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = request.user.id if request.user and request.user.is_authenticated else None
        
        process_bulk_delete_task.delay(ids, user_id=user_id)
        
        return Response({'message': 'Bulk deletion queued for processing.'}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['delete'], url_path='remove-file', permission_classes=[IsAuthenticated])
    def remove_file(self, request, pk=None):
        # Update reference to remove file and optionally change access_type
        success, result = self.service.update_reference(
            pk, 
            {'access_file': None, 'access_type': 'none'}, 
            request=request
        )
        if success:
            return Response({'detail': 'File removed successfully'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Failed to remove file'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='preview', permission_classes=[AllowAny])
    def preview(self, request, pk=None):
        ref = self.service.repo.get_by_id(pk)
        if not ref or not ref.access_file:
            return Response({'detail': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        ext = ref.access_file.name.split('.')[-1].lower()
        if ext == 'pdf':
            return Response({'redirect': ref.access_file.url}, status=status.HTTP_200_OK)
        
        # Docx to HTML
        if ext == 'docx':
            try:
                import mammoth
                with ref.access_file.open('rb') as docx_file:
                    result = mammoth.convert_to_html(docx_file)
                    return Response({'html': result.value}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({'detail': 'Preview not supported for this file type'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-import', permission_classes=[IsAuthenticated])
    def bulk_import(self, request):
        """
        Accepts a JSON array of reference objects, validates each row, and bulk-inserts them.
        Returns { imported: N, errors: [...] }.
        """
        records = request.data
        if not isinstance(records, list):
            return Response(
                {'detail': 'Expected a JSON array of reference objects.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(records) == 0:
            return Response(
                {'detail': 'No records provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(records) > 5000:
            return Response(
                {'detail': 'Maximum 5,000 records per import batch.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        process_bulk_import_task.delay(records)

        return Response({
            'message': 'Bulk import queued for processing.',
            'total_submitted': len(records),
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['post'], url_path='sync-preview', permission_classes=[IsAuthenticated])
    def sync_preview(self, request):
        """
        Accepts a JSON array of reference objects and compares against the DB.
        Returns a diff showing to_create, to_update, to_delete, and unchanged counts.
        """
        records = request.data
        if not isinstance(records, list):
            return Response({'detail': 'Expected a JSON array of reference objects.'}, status=status.HTTP_400_BAD_REQUEST)
        
        diff = self.service.compute_sync_diff(records)
        return Response(diff, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='sync-commit', permission_classes=[IsAuthenticated])
    def sync_commit(self, request):
        """
        Atomically applies a confirmed sync diff.
        Expects payload: { to_create: [], to_update: [], to_delete: [ids], apply_deletions: bool }
        """
        payload = request.data
        to_create = payload.get('to_create', [])
        to_update = payload.get('to_update', [])
        to_delete_ids = payload.get('to_delete', [])
        apply_deletions = payload.get('apply_deletions', False)

        if not isinstance(to_create, list) or not isinstance(to_update, list) or not isinstance(to_delete_ids, list):
            return Response({'detail': 'Invalid payload format.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.user.id if request.user and request.user.is_authenticated else None
        
        # Dispatch to Celery background task
        process_sync_chunk_task.delay(
            to_create, 
            to_update, 
            to_delete_ids, 
            apply_deletions, 
            user_id
        )
        
        return Response(
            {'message': 'Sync chunk queued for processing.'}, 
            status=status.HTTP_202_ACCEPTED
        )

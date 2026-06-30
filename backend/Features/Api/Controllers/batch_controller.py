# [Layer: Api/Controllers] — batch_controller.py
# Endpoints for Batch management

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from Features.Services.Implementations.batch_service import BatchService
from Features.Api.Serializers.batch_serializer import (
    AcquisitionBatchSerializer,
    AcquisitionBatchDetailSerializer,
    BatchHistorySerializer,
    BatchBookSerializer
)

class AcquisitionBatchViewSet(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = BatchService()

    def get_permissions(self):
        if self.action == 'current':
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request):
        batches = self.service.get_all_batches()
        serializer = AcquisitionBatchSerializer(batches, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        batch = self.service.get_batch_by_id(pk)
        if not batch:
            return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AcquisitionBatchDetailSerializer(batch, context={'request': request})
        return Response(serializer.data)

    def create(self, request):
        try:
            batch = self.service.create_batch(request.data, request.user.id)
            serializer = AcquisitionBatchSerializer(batch)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        try:
            batch = self.service.update_batch(pk, request.data, request.user.id)
            if not batch:
                return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = AcquisitionBatchSerializer(batch)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        try:
            batch = self.service.close_batch(pk, request.user.id)
            if not batch:
                return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"status": "Batch closed"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        try:
            batch = self.service.archive_batch(pk, request.user.id)
            if not batch:
                return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"status": "Batch archived"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        try:
            batch = self.service.activate_batch(pk, request.user.id)
            if not batch:
                return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"status": "Batch activated as display"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        try:
            batch = self.service.reopen_batch(pk, request.user.id)
            if not batch:
                return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"status": "Batch reopened"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def current(self, request):
        batch = self.service.get_current_display_batch()
        if not batch:
            return Response({"message": "No newly acquired books available."})
        serializer = AcquisitionBatchDetailSerializer(batch, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def books(self, request, pk=None):
        """Add a book to a batch. Supports multipart/form-data for cover_image uploads."""
        try:
            # Merge query data with uploaded files
            data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
            files = request.FILES
            book = self.service.add_book_to_batch(pk, data, files, request.user.id)
            serializer = BatchBookSerializer(book, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='books/(?P<book_id>[^/.]+)')
    def book_detail(self, request, pk=None, book_id=None):
        """Remove a book from a batch."""
        try:
            deleted = self.service.remove_book_from_batch(pk, book_id, request.user.id)
            if not deleted:
                return Response({"error": "Book not found in this batch"}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        history = self.service.get_batch_history(pk)
        serializer = BatchHistorySerializer(history, many=True)
        return Response(serializer.data)

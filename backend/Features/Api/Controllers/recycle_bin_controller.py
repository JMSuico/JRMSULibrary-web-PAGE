# [Layer: Api/Controllers] — recycle_bin_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from Features.Services.Implementations.recycle_bin_service import RecycleBinService
from Features.Repositories.Implementations import (
    RecycleBinRepository, 
    NewlyAcquiredBookRepository, 
    LibraryInteriorImageRepository
)
from Features.Api.Serializers.recycle_bin_serializer import RecycleBinSerializer

class RecycleBinViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = RecycleBinService(
            RecycleBinRepository(),
            NewlyAcquiredBookRepository(),
            LibraryInteriorImageRepository()
        )

    def list(self, request):
        module = request.query_params.get('module')
        if module:
            data = self.service.get_by_module(module)
        else:
            data = self.service.get_all()
        return Response(RecycleBinSerializer(data, many=True).data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        success = self.service.restore_item(pk)
        if success:
            return Response({"status": "Item restored successfully"})
        return Response({"error": "Failed to restore item"}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        success = self.service.delete_permanently(pk)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Failed to delete item"}, status=status.HTTP_404_NOT_FOUND)

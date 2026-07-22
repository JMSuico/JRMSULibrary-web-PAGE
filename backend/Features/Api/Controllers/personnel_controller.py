# [Layer: Api/Controllers] — personnel_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Api.Serializers.personnel_serializer import PersonnelSerializer
from Features.Repositories.Implementations.personnel_repository import PersonnelRepository
from Features.Services.Implementations.personnel_service import PersonnelService

class PersonnelViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PersonnelService(PersonnelRepository())

    def list(self, request):
        personnel = self.service.get_personnel_list()
        serializer = PersonnelSerializer(personnel, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        personnel = self.service.get_personnel_by_id(pk)
        if not personnel:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PersonnelSerializer(personnel)
        return Response(serializer.data)

    def create(self, request):
        serializer = PersonnelSerializer(data=request.data)
        if serializer.is_valid():
            personnel = self.service.create_personnel(serializer.validated_data)
            return Response(PersonnelSerializer(personnel).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        serializer = PersonnelSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            personnel = self.service.update_personnel(pk, serializer.validated_data)
            if not personnel:
                return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(PersonnelSerializer(personnel).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        success = self.service.delete_personnel(pk, user_id)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

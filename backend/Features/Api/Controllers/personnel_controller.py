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

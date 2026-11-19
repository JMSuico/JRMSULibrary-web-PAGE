# [Layer: Api/Controllers] — personnel_controller.py
from collections.abc import Mapping
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Api.Serializers.personnel_serializer import PersonnelSerializer
from Features.Services.Implementations.personnel_service import PersonnelService

NO_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, max-age=0'


def _with_no_cache_headers(response: Response) -> Response:
    response['Cache-Control'] = NO_CACHE_CONTROL
    response['Pragma'] = 'no-cache'
    return response


class PersonnelViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PersonnelService()

    def list(self, request):
        personnel = self.service.get_personnel_list()
        serializer = PersonnelSerializer(personnel, many=True)
        return _with_no_cache_headers(Response(serializer.data))

    def retrieve(self, request, pk=None):
        personnel = self.service.get_personnel_by_id(pk)
        if not personnel:
            return _with_no_cache_headers(
                Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            )
        serializer = PersonnelSerializer(personnel)
        return _with_no_cache_headers(Response(serializer.data))

    def create(self, request):
        if not isinstance(request.data, Mapping):
            return _with_no_cache_headers(
                Response({'detail': 'Expected an object payload.'}, status=status.HTTP_400_BAD_REQUEST)
            )
        serializer = PersonnelSerializer(data=request.data)
        if serializer.is_valid():
            personnel = self.service.create_personnel(serializer.validated_data)
            return _with_no_cache_headers(
                Response(PersonnelSerializer(personnel).data, status=status.HTTP_201_CREATED)
            )
        return _with_no_cache_headers(
            Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        )

    def update(self, request, pk=None):
        if not isinstance(request.data, Mapping):
            return _with_no_cache_headers(
                Response({'detail': 'Expected an object payload.'}, status=status.HTTP_400_BAD_REQUEST)
            )
        serializer = PersonnelSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            personnel = self.service.update_personnel(pk, serializer.validated_data)
            if not personnel:
                return _with_no_cache_headers(
                    Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
                )
            return _with_no_cache_headers(Response(PersonnelSerializer(personnel).data))
        return _with_no_cache_headers(
            Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        )

    def partial_update(self, request, pk=None):
        return self.update(request, pk=pk)

    def destroy(self, request, pk=None):
        user_id = request.user.id if request.user.is_authenticated else None
        success = self.service.delete_personnel(pk, user_id)
        if success:
            return _with_no_cache_headers(Response(status=status.HTTP_204_NO_CONTENT))
        return _with_no_cache_headers(
            Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        )

# [Layer: Api/Controllers] — user_controller.py

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from Features.Api.Serializers.user_serializer import UserSerializer, UserCreateUpdateSerializer
from Features.Services.Implementations.user_service import UserService
from Features.Repositories.Implementations.user_repository import UserRepository

class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class UserViewSet(viewsets.ViewSet):
    # For now, we only allow superusers to manage other admins. 
    # If standard admins should manage it, we can change to IsAuthenticated and is_staff
    permission_classes = [permissions.IsAuthenticated] 

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = UserService(UserRepository())

    def list(self, request):
        return Response(UserSerializer(self.service.get_all(), many=True).data)

    def retrieve(self, request, pk=None):
        item = self.service.get_by_id(pk)
        return Response(UserSerializer(item).data) if item else Response(status=404)

    def create(self, request):
        ser = UserCreateUpdateSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(UserSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def update(self, request, pk=None):
        ser = UserCreateUpdateSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            return Response(UserSerializer(item).data) if item else Response(status=404)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        return Response(status=204) if self.service.delete(pk) else Response(status=404)

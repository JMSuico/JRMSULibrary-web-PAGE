# [Layer: Api/Controllers] — user_controller.py

from rest_framework import viewsets, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from Features.Api.Serializers.user_serializer import UserSerializer, UserCreateUpdateSerializer
from Features.Services.Implementations.user_service import UserService
from Features.Repositories.Implementations.user_repository import UserRepository

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'

class UserViewSet(viewsets.ViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        if self.action == 'login':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = UserService(UserRepository())

    def _serialize(self, user, request=None):
        return UserSerializer(user, context={"request": request}).data

    def list(self, request):
        return Response([self._serialize(u, request) for u in self.service.get_all()])

    def retrieve(self, request, pk=None):
        item = self.service.get_by_id(pk)
        return Response(self._serialize(item, request)) if item else Response(status=404)

    @action(detail=False, methods=["get"])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)
        return Response(self._serialize(request.user, request))

    @action(detail=False, methods=["post"], throttle_classes=[LoginRateThrottle])
    def login(self, request):
        from django.contrib.auth import authenticate, login
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response(self._serialize(user, request))
        return Response({"error": "Invalid credentials"}, status=400)

    @action(detail=False, methods=["post"])
    def logout(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({"message": "Successfully logged out."})

    def create(self, request):
        ser = UserCreateUpdateSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(self._serialize(item, request), status=201)
        return Response(ser.errors, status=400)

    def update(self, request, pk=None):
        item = self.service.get_by_id(pk)
        if not item:
            return Response(status=404)
        ser = UserCreateUpdateSerializer(item, data=request.data, partial=True)
        if ser.is_valid():
            updated = ser.save()
            return Response(self._serialize(updated, request))
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        return Response(status=204) if self.service.delete(pk) else Response(status=404)

    @action(detail=True, methods=["post"], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_avatar(self, request, pk=None):
        """Dedicated endpoint to update only the avatar of a user."""
        item = self.service.get_by_id(pk)
        if not item:
            return Response(status=404)
        avatar_file = request.FILES.get("avatar")
        if not avatar_file:
            return Response({"error": "No avatar file provided"}, status=400)
        
        # Validate file extension
        ext = avatar_file.name.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'webp', 'gif']:
            return Response({"error": "Invalid image format. Allowed formats: jpg, jpeg, png, webp, gif"}, status=400)

        # Delete old avatar file if it exists
        if item.avatar:
            item.avatar.delete(save=False)
        item.avatar = avatar_file
        item.save()
        return Response(self._serialize(item, request))

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=400)
        if not request.user.check_password(old_password):
            return Response({"error": "Incorrect old password"}, status=400)
        request.user.set_password(new_password)
        request.user.save()
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, request.user)
        return Response({"message": "Password changed successfully"})

    @action(detail=False, methods=["post"])
    def update_profile(self, request):
        """Let the current authenticated user update their own profile fields."""
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        user = request.user
        allowed_fields = ["first_name", "last_name", "email", "username"]
        updated = False

        for field in allowed_fields:
            value = request.data.get(field)
            if value is not None and value != getattr(user, field):
                # Validate username uniqueness
                if field == "username":
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    if User.objects.filter(username=value).exclude(pk=user.pk).exists():
                        return Response({"error": "Username already taken"}, status=400)
                # Validate email uniqueness
                if field == "email":
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    if User.objects.filter(email=value).exclude(pk=user.pk).exists():
                        return Response({"error": "Email already in use"}, status=400)
                setattr(user, field, value)
                updated = True

        if updated:
            user.save()

        return Response(self._serialize(user, request))

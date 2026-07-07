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
        return bool(request.user and request.user.is_staff)

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'

class UserViewSet(viewsets.ViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperUser()]
        if self.action in ['login', 'request_password_reset', 'reset_password_with_code']:
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
        from django.core.cache import cache
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username:
            return Response({"error": "Username required"}, status=400)
            
        cache_key = f"login_attempts_{username}"
        attempts = cache.get(cache_key, 0)
        if attempts >= 10:
            return Response({"error": "Account temporarily locked due to too many failed attempts. Try again in 15 minutes."}, status=429)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            cache.delete(cache_key)
            login(request, user)
            return Response(self._serialize(user, request))
            
        cache.set(cache_key, attempts + 1, timeout=900)  # 15 minutes lockout
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
        
        # Send notification email
        from django.core.mail import send_mail
        from django.conf import settings
        if request.user.email:
            try:
                send_mail(
                    subject="Your password has been changed",
                    message="This is a confirmation that the password for your JRMSU Library account has been changed. If you did not make this change, please contact an administrator immediately.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    fail_silently=True
                )
            except Exception:
                pass
                
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

    @action(detail=False, methods=["post"], throttle_classes=[AnonRateThrottle])
    def request_password_reset(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)
            
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()
        
        if not user:
            # Return 200 anyway to prevent email enumeration
            return Response({"message": "If that email exists in our system, a reset code has been sent."})
            
        import random
        import string
        code = ''.join(random.choices(string.digits, k=8))
        
        from django.core.cache import cache
        cache_key = f"pwd_reset_{email.lower()}"
        cache.set(cache_key, code, timeout=900) # 15 minutes
        
        from django.core.mail import send_mail
        from django.conf import settings
        try:
            send_mail(
                subject="Password Reset Code",
                message=f"Your password reset code for JRMSU Library Admin Portal is: {code}\n\nThis code is valid for 15 minutes. If you did not request this, please ignore this email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True
            )
        except Exception:
            pass
            
        return Response({"message": "If that email exists in our system, a reset code has been sent."})

    @action(detail=False, methods=["post"], throttle_classes=[AnonRateThrottle])
    def reset_password_with_code(self, request):
        email = request.data.get("email")
        code = request.data.get("code")
        new_password = request.data.get("new_password")
        
        if not email or not code or not new_password:
            return Response({"error": "Email, code, and new password are required"}, status=400)
            
        from django.core.cache import cache
        cache_key = f"pwd_reset_{email.lower()}"
        cached_code = cache.get(cache_key)
        
        if not cached_code or cached_code != code:
            return Response({"error": "Invalid or expired reset code"}, status=400)
            
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()
        
        if not user:
            return Response({"error": "User not found"}, status=404)
            
        user.set_password(new_password)
        user.save()
        cache.delete(cache_key) # Invalidate code immediately
        
        return Response({"message": "Password successfully reset. You can now log in."})

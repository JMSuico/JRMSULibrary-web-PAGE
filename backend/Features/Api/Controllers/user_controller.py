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

    @action(detail=False, methods=["post"], throttle_classes=[LoginRateThrottle], authentication_classes=[])
    def login(self, request):
        from django.contrib.auth import authenticate, login
        from django.core.cache import cache
        username = request.data.get("username")
        password = request.data.get("password")
        
        if not username:
            return Response({"error": "Username required"}, status=400)
            
        cache_key = f"login_attempts_{username}"
        cache_key_ts = f"login_lockout_ts_{username}"
        attempts = cache.get(cache_key, 0)
        if attempts >= 5:
            import time
            lockout_start = cache.get(cache_key_ts, 0)
            elapsed = int(time.time() - lockout_start) if lockout_start else 0
            remaining = max(600 - elapsed, 0)
            remaining_min = remaining // 60
            remaining_sec = remaining % 60
            return Response({"error": f"Account temporarily locked due to too many failed attempts. Try again in {remaining_min}m {remaining_sec}s."}, status=429)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            cache.delete(cache_key)
            cache.delete(cache_key_ts)
            
            from django.utils import timezone
            # Enforce single device login: Strict Lockout if currently online
            if user.last_active and (timezone.now() - user.last_active).total_seconds() < 60:
                return Response({"error": "Account already online cant be Login!"}, status=403)
            
            user.last_active = timezone.now()
            user.save(update_fields=['last_active'])
            
            # Clear old sessions just to be clean
            from django.contrib.sessions.models import Session
            for session in Session.objects.filter(expire_date__gte=timezone.now()):
                session_data = session.get_decoded()
                if str(user.pk) == str(session_data.get('_auth_user_id')):
                    session.delete()
            
            login(request, user)
            return Response(self._serialize(user, request))
            
        import time
        new_attempts = attempts + 1
        cache.set(cache_key, new_attempts, timeout=600)  # 10 minutes lockout
        if new_attempts >= 5:
            cache.set(cache_key_ts, time.time(), timeout=600)
        remaining_attempts = max(5 - new_attempts, 0)
        return Response({"error": f"Invalid username or password. You have {remaining_attempts} attempt(s) remaining."}, status=400)

    @action(detail=False, methods=["post"])
    def logout(self, request):
        from django.contrib.auth import logout
        from django.core.cache import cache
        if request.user.is_authenticated:
            cache.delete(f"login_attempts_{request.user.username}")
            cache.delete(f"login_lockout_ts_{request.user.username}")
            request.user.last_active = None
            request.user.save(update_fields=['last_active'])
        logout(request)
        return Response({"message": "Successfully logged out."})

    @action(detail=True, methods=["post"])
    def force_logout(self, request, pk=None):
        user = self.service.get_by_id(pk)
        if not user:
            return Response(status=404)
        
        # Clear their last active timestamp
        user.last_active = None
        user.save(update_fields=['last_active'])
        
        # Clear their sessions from the database
        from django.contrib.sessions.models import Session
        from django.utils import timezone
        for session in Session.objects.filter(expire_date__gte=timezone.now()):
            session_data = session.get_decoded()
            if str(user.pk) == str(session_data.get('_auth_user_id')):
                session.delete()
                
        # Also clear any cache locks
        from django.core.cache import cache
        cache.delete(f"login_attempts_{user.username}")
        cache.delete(f"login_lockout_ts_{user.username}")
        
        return Response({"message": f"User {user.username} was forced to log out."})

    @action(detail=False, methods=["post"])
    def heartbeat(self, request):
        if not request.user.is_authenticated:
            return Response(status=401)
        from django.utils import timezone
        request.user.last_active = timezone.now()
        request.user.save(update_fields=['last_active'])
        return Response({"status": "ok"})

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

        # Rename file to UUID to avoid browser caching issues when updating
        import uuid
        avatar_file.name = f"{uuid.uuid4().hex}.{ext}"

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
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response({"error": " ".join(e.messages)}, status=400)
            
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

        from django.core.cache import cache
        import time
        reset_attempt_key = f"reset_attempts_{email.lower()}"
        reset_lockout_key = f"reset_lockout_ts_{email.lower()}"
        reset_attempts = cache.get(reset_attempt_key, 0)
        if reset_attempts >= 3:
            lockout_start = cache.get(reset_lockout_key, 0)
            elapsed = int(time.time() - lockout_start) if lockout_start else 0
            remaining = max(300 - elapsed, 0)
            remaining_min = remaining // 60
            remaining_sec = remaining % 60
            return Response({"error": f"Too many reset requests. Try again in {remaining_min}m {remaining_sec}s."}, status=429)
            
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

        # Increment reset attempt counter
        new_reset_attempts = reset_attempts + 1
        cache.set(reset_attempt_key, new_reset_attempts, timeout=300)  # 5 minutes cooldown
        if new_reset_attempts >= 3:
            cache.set(reset_lockout_key, time.time(), timeout=300)
            
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
            
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": " ".join(e.messages)}, status=400)
            
        user.set_password(new_password)
        user.save()
        cache.delete(cache_key) # Invalidate code immediately
        
        return Response({"message": "Password successfully reset. You can now log in."})

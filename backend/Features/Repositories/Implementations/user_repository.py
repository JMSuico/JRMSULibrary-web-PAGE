# [Layer: Repositories/Implementations] — user_repository.py
from django.contrib.auth import get_user_model

User = get_user_model()
from Features.Repositories.Interfaces.i_user_repository import IUserRepository

class UserRepository(IUserRepository):
    def get_all(self):
        return list(User.objects.all().order_by('-date_joined'))

    def get_by_id(self, user_id: int):
        return User.objects.filter(id=user_id).first()

    def create(self, data: dict):
        password = data.pop('password', None)
        data['is_staff'] = True  # All users created here are admins
        user = User(**data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, user_id: int, data: dict):
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        password = data.pop('password', None)
        for key, value in data.items():
            setattr(user, key, value)
            
        if password:
            user.set_password(password)
            
        user.save()
        return user

    def delete(self, user_id: int) -> bool:
        user = self.get_by_id(user_id)
        if user:
            user.delete()
            return True
        return False

    def get_by_email(self, email: str):
        return User.objects.filter(email=email).first()

    def username_exists_exclude_user(self, username: str, exclude_user_id: int) -> bool:
        return User.objects.filter(username=username).exclude(pk=exclude_user_id).exists()

    def email_exists_exclude_user(self, email: str, exclude_user_id: int) -> bool:
        return User.objects.filter(email=email).exclude(pk=exclude_user_id).exists()

    def clear_user_sessions(self, user_id: int, current_session_key: str = None):
        from django.contrib.sessions.models import Session
        from django.utils import timezone
        for session in Session.objects.filter(expire_date__gte=timezone.now()):
            if current_session_key and session.session_key == current_session_key:
                continue
            session_data = session.get_decoded()
            if str(user_id) == str(session_data.get('_auth_user_id')):
                session.delete()

    def clear_all_sessions_and_status(self):
        from django.contrib.sessions.models import Session
        User.objects.all().update(last_active=None)
        Session.objects.all().delete()

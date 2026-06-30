from django.contrib.auth.models import User
from Features.Repositories.Interfaces.i_user_repository import IUserRepository

class UserRepository(IUserRepository):
    def get_all(self):
        return list(User.objects.all().order_by('-date_joined'))

    def get_by_id(self, user_id: int):
        return User.objects.filter(id=user_id).first()

    def create(self, data: dict):
        password = data.pop('password', None)
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

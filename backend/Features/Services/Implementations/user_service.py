# [Layer: Services/Implementations] — user_service.py
from Features.Services.Interfaces.i_user_service import IUserService
from Features.Repositories.Interfaces.i_user_repository import IUserRepository

class UserService(IUserService):
    def __init__(self, repo: IUserRepository = None):
        if repo is None:
            from Features.Repositories.Implementations.user_repository import UserRepository
            repo = UserRepository()
        self._repo = repo

    def get_all(self):
        return self._repo.get_all()
        
    def get_by_id(self, user_id: int):
        return self._repo.get_by_id(user_id)

    def create(self, data: dict):
        return self._repo.create(data)

    def update(self, user_id: int, data: dict):
        return self._repo.update(user_id, data)

    def delete(self, user_id: int) -> bool:
        return self._repo.delete(user_id)

    def get_by_email(self, email: str):
        return self._repo.get_by_email(email)

    def username_exists_exclude_user(self, username: str, exclude_user_id: int) -> bool:
        return self._repo.username_exists_exclude_user(username, exclude_user_id)

    def email_exists_exclude_user(self, email: str, exclude_user_id: int) -> bool:
        return self._repo.email_exists_exclude_user(email, exclude_user_id)

    def clear_user_sessions(self, user_id: int, current_session_key: str = None):
        self._repo.clear_user_sessions(user_id, current_session_key)

    def clear_last_active(self, user_id: int) -> int:
        return self._repo.clear_last_active(user_id)

    def touch_heartbeat_if_active(self, user_id: int, now) -> int:
        return self._repo.touch_heartbeat_if_active(user_id, now)

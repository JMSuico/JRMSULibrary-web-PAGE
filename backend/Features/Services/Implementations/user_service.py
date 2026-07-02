from Features.Services.Interfaces.i_user_service import IUserService
from Features.Repositories.Interfaces.i_user_repository import IUserRepository

class UserService(IUserService):
    def __init__(self, repo: IUserRepository):
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

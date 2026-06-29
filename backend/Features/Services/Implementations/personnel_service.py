from typing import List, Optional, Any
from Features.Services.Interfaces import IPersonnelService
from Features.Repositories.Interfaces import IPersonnelRepository

class PersonnelService(IPersonnelService):
    def __init__(self, repo: IPersonnelRepository):
        self._repo = repo

    def get_personnel_list(self) -> List[Any]:
        return self._repo.get_all()

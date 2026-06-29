from typing import List, Optional, Any
from Features.Services.Interfaces import ISiteVisitService
from Features.Repositories.Interfaces import ISiteVisitRepository

class SiteVisitService(ISiteVisitService):
    def __init__(self, repo: ISiteVisitRepository):
        self._repo = repo

    def get_all_visits(self) -> List[Any]:
        return self._repo.get_all()

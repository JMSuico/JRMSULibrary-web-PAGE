from typing import List, Optional, Any
from Features.Data.Models import SiteVisit
from Features.Repositories.Interfaces import ISiteVisitRepository

class SiteVisitRepository(ISiteVisitRepository):
    def get_all(self) -> List[Any]:
        return list(SiteVisit.objects.all())

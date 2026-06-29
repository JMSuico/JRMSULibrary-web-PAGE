from typing import List, Optional, Any
from Features.Data.Models import Personnel
from Features.Repositories.Interfaces import IPersonnelRepository

class PersonnelRepository(IPersonnelRepository):
    def get_all(self) -> List[Any]:
        return list(Personnel.objects.filter(is_active=True))

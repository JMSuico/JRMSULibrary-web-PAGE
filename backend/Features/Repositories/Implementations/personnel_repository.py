# [Layer: Repositories/Implementations] — personnel_repository.py
from typing import List, Optional, Any
from Features.Data.Models import Personnel
from Features.Repositories.Interfaces import IPersonnelRepository

class PersonnelRepository(IPersonnelRepository):
    def get_all(self) -> List[Any]:
        return list(Personnel.objects.all().order_by('order'))

    def get_by_id(self, personnel_id: int) -> Optional[Any]:
        return Personnel.objects.filter(id=personnel_id).first()

    def create(self, data: dict) -> Any:
        return Personnel.objects.create(**data)

    def update(self, personnel_id: int, data: dict) -> Optional[Any]:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            for key, value in data.items():
                setattr(personnel, key, value)
            personnel.save()
        return personnel

    def delete(self, personnel_id: int) -> bool:
        personnel = self.get_by_id(personnel_id)
        if personnel:
            personnel.delete()
            return True
        return False

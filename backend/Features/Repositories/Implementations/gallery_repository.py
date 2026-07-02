from typing import List, Optional, Any
from Features.Data.Models import LibraryInteriorImage
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository

class LibraryInteriorImageRepository(ILibraryInteriorImageRepository):
    def get_all_active(self):
        return list(LibraryInteriorImage.objects.filter(is_active=True).order_by('-created_at'))

    def get_all(self):
        return list(LibraryInteriorImage.objects.all().order_by('-created_at'))
        
    def get_by_id(self, image_id: int):
        return LibraryInteriorImage.objects.filter(id=image_id).first()

    def create(self, data: dict):
        return LibraryInteriorImage.objects.create(**data)

    def update(self, image_id: int, data: dict):
        LibraryInteriorImage.objects.filter(id=image_id).update(**data)
        return self.get_by_id(image_id)

    def delete(self, image_id: int) -> bool:
        obj = self.get_by_id(image_id)
        if obj:
            obj.delete()
            return True
        return False

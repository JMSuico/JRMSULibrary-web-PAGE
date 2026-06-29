from typing import List, Optional, Any
from Features.Data.Models import LibraryInteriorImage
from Features.Repositories.Interfaces import ILibraryInteriorImageRepository

class LibraryInteriorImageRepository(ILibraryInteriorImageRepository):
    def get_all_active(self) -> List[Any]:
        return list(LibraryInteriorImage.objects.filter(is_active=True))

# [Layer: Repositories/Interfaces] — i_recycle_bin_repository.py
from typing import List, Optional, Any

class IRecycleBinRepository:
    def get_all(self) -> List[Any]:
        pass
        
    def get_by_module(self, module: str) -> List[Any]:
        pass

    def get_by_id(self, id: int) -> Optional[Any]:
        pass

    def create(self, original_id: int, source_module: str, item_name: str, data_snapshot: dict, user_id: int = None) -> Any:
        pass

    def delete_permanently(self, id: int) -> bool:
        pass

    def delete_older_than(self, days: int) -> int:
        pass

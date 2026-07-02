# [Layer: Services/Interfaces] — i_recycle_bin_service.py
from typing import List, Optional, Any

class IRecycleBinService:
    def get_all(self) -> List[Any]:
        pass

    def get_by_module(self, module: str) -> List[Any]:
        pass

    def restore_item(self, id: int) -> bool:
        pass

    def delete_permanently(self, id: int) -> bool:
        pass

    def auto_cleanup(self) -> int:
        pass

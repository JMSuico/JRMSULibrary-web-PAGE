# [Layer: Services/Interfaces] — i_settings_service.py
from abc import ABC, abstractmethod
from typing import Any

class ISettingsService(ABC):
    @abstractmethod
    def get_settings(self) -> Any:
        pass

    @abstractmethod
    def update_settings(self, data: dict) -> Any:
        pass

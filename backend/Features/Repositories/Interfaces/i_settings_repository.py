# [Layer: Repositories/Interfaces] — i_settings_repository.py
from abc import ABC, abstractmethod
from typing import Any

class ISettingsRepository(ABC):
    @abstractmethod
    def get_settings(self) -> Any:
        pass

    @abstractmethod
    def update_settings(self, data: dict) -> Any:
        pass

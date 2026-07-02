# [Layer: Services/Implementations] — settings_service.py
# Business logic layer for SiteSettings.

from Features.Repositories.Implementations.settings_repository import SettingsRepository
from Features.Data.Models.site_settings_model import SiteSettings

class SettingsService:
    def __init__(self, repository: SettingsRepository = None):
        self.repository = repository or SettingsRepository()

    def get_settings(self) -> SiteSettings:
        return self.repository.get_settings()

    def update_settings(self, data: dict) -> SiteSettings:
        # We can add business logic here (e.g., validate times, format phone numbers)
        return self.repository.update_settings(data)

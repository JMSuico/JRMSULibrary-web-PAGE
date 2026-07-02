# [Layer: Repositories/Implementations] — settings_repository.py
# Abstract data access for SiteSettings. Ensures a singleton pattern.

from Features.Data.Models.site_settings_model import SiteSettings

class SettingsRepository:
    def get_settings(self) -> SiteSettings:
        # Always return the first record, create it if it doesn't exist
        settings, _ = SiteSettings.objects.get_or_create(id=1)
        return settings

    def update_settings(self, data: dict) -> SiteSettings:
        settings = self.get_settings()
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        settings.save()
        return settings

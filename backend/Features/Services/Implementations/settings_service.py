# [Layer: Services/Implementations] — settings_service.py
# Business logic layer for SiteSettings.

from Features.Repositories.Implementations.settings_repository import (
    SettingsRepository,
    notify_settings_updated,
)
from Features.Data.Models.site_settings_model import (
    SiteSettings,
    normalize_room_availability,
)
from Features.Services.Interfaces.i_settings_service import ISettingsService

class SettingsService(ISettingsService):
    def __init__(self, repository: SettingsRepository = None):
        self.repository = repository or SettingsRepository()

    def get_settings(self) -> SiteSettings:
        settings = self.repository.get_settings()
        if settings is not None and hasattr(settings, 'room_availability'):
            settings.room_availability = normalize_room_availability(
                getattr(settings, 'room_availability', None)
            )
        return settings

    def update_settings(self, data: dict) -> SiteSettings:
        payload = dict(data or {})
        if 'room_availability' in payload:
            current = self.repository.get_settings()
            existing = getattr(current, 'room_availability', None) if current is not None else None
            payload['room_availability'] = normalize_room_availability(
                payload['room_availability'],
                existing=existing,
            )
        updated = self.repository.update_settings(payload)
        if not isinstance(self.repository, SettingsRepository):
            notify_settings_updated()
        if updated is not None and hasattr(updated, 'room_availability'):
            updated.room_availability = normalize_room_availability(
                getattr(updated, 'room_availability', None)
            )
        return updated

# [Layer: Repositories/Implementations] — settings_repository.py
# Abstract data access for SiteSettings. Ensures a singleton pattern.

from Features.Data.Models.site_settings_model import (
    SiteSettings,
    normalize_room_availability,
)
from Features.Repositories.Interfaces.i_settings_repository import ISettingsRepository


def notify_settings_updated() -> None:
    """Clear cached AI institutional context and broadcast live admin updates."""
    try:
        from django.core.cache import cache
        cache.delete("rizal_institution_context")
    except Exception:
        pass

    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "admin_updates",
                {
                    "type": "admin_update",
                    "message": "database_updated",
                },
            )
    except Exception:
        # Silently ignore if Channels/Redis is not configured in this environment
        pass


class SettingsRepository(ISettingsRepository):
    def get_settings(self) -> SiteSettings:
        # Always return the first record, create it if it doesn't exist
        settings, _ = SiteSettings.objects.get_or_create(id=1)
        settings.room_availability = normalize_room_availability(
            getattr(settings, 'room_availability', None)
        )
        return settings

    def update_settings(self, data: dict) -> SiteSettings:
        settings = self.get_settings()
        payload = dict(data or {})
        if 'room_availability' in payload:
            incoming_rooms = payload.pop('room_availability')
            settings.room_availability = normalize_room_availability(
                incoming_rooms,
                existing=getattr(settings, 'room_availability', None),
            )
        else:
            settings.room_availability = normalize_room_availability(
                getattr(settings, 'room_availability', None)
            )
        for key, value in payload.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        settings.save()
        notify_settings_updated()
        return settings

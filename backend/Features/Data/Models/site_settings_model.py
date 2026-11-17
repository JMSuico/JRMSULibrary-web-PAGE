# [Layer: Data/Models] — site_settings_model.py
# Represents the global configuration for the Library. Only one instance should ideally exist.

import json
from django.db import models


DEFAULT_RESERVATION_ROOMS = (
    "Discussion Room 1",
    "Discussion Room 2",
    "Tutorium Room 1",
    "Tutorium Room 2",
    "Multimedia Room",
    "Workstation",
)

LEGACY_COMLAB_KEYS = (
    "Library ComLab (Computer Laboratory)",
    "Library ComLab",
    "ComLab",
)


def default_room_availability() -> dict:
    """Return the canonical room availability mapping with all rooms enabled."""
    return {room: True for room in DEFAULT_RESERVATION_ROOMS}


def _coerce_room_bool(value) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() not in {"false", "0", "no", "off", ""}
    return bool(value)


def normalize_room_availability(raw=None, existing=None) -> dict:
    """Normalize room availability dict across the canonical 6 reservation rooms."""
    normalized = (
        normalize_room_availability(existing)
        if existing is not None
        else default_room_availability()
    )
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except (ValueError, TypeError):
            raw = None
    if not isinstance(raw, dict):
        return normalized
    for room in DEFAULT_RESERVATION_ROOMS:
        if room in raw and raw[room] is not None:
            normalized[room] = _coerce_room_bool(raw[room])
    if "Workstation" not in raw or raw["Workstation"] is None:
        for legacy_key in LEGACY_COMLAB_KEYS:
            if legacy_key in raw and raw[legacy_key] is not None:
                normalized["Workstation"] = _coerce_room_bool(raw[legacy_key])
                break
        else:
            lowered_raw = {
                str(k).strip().lower(): v
                for k, v in raw.items()
                if v is not None
            }
            for legacy_key in LEGACY_COMLAB_KEYS:
                key_lower = legacy_key.lower()
                if key_lower in lowered_raw:
                    normalized["Workstation"] = _coerce_room_bool(lowered_raw[key_lower])
                    break
    return normalized


class SiteSettings(models.Model):
    id = models.AutoField(primary_key=True)
    library_name = models.CharField(max_length=255, default="JRMSU Katipunan Library")
    address = models.CharField(max_length=500, default="Katipunan, Zamboanga del Norte")
    contact_email = models.EmailField(default="katipunan.library@jrmsu.edu.ph")
    alternate_email = models.EmailField(default="jrmsukclibrary@gmail.com", blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Opening Hours
    opening_hours_mon_fri = models.CharField(max_length=100, default="7:00 AM - 7:00 PM")
    opening_hours_sat = models.CharField(max_length=100, default="Closed")
    opening_hours_sun = models.CharField(max_length=100, default="Closed")

    # UI Settings
    carousel_style = models.CharField(max_length=20, default='default', choices=[('default', 'Default (3D)'), ('classic', 'Classic (Horizontal)')])
    background_image = models.ImageField(upload_to='settings/', null=True, blank=True)

    # Room Availability Settings
    room_availability = models.JSONField(default=default_room_availability, blank=True)

    # The singleton pattern is enforced at the repository/service layer
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'
        app_label = 'Features'

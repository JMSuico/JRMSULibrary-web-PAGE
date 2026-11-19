# [Layer: Helpers] — media_cleanup_helper.py
"""Shared helper for safely deleting replaced local/S3 media files and `_thumb.webp` sidecars."""

import os
from django.conf import settings
from django.core.files.storage import default_storage


def thumb_sidecar_name(image_name: str) -> str:
    """Return the companion `_thumb.webp` relative path for an uploaded image path."""
    stem, _ = os.path.splitext(image_name)
    return f"{stem}_thumb.webp"


def _delete_local_media_file_safely(real_media_root: str, relative_name: str) -> None:
    if not relative_name or "\x00" in relative_name:
        return
    candidate = os.path.join(real_media_root, relative_name)
    real_target = os.path.realpath(candidate)
    try:
        within_media_root = os.path.commonpath([real_media_root, real_target]) == real_media_root
    except ValueError:
        return
    if not within_media_root or real_target == real_media_root:
        return
    if os.path.isfile(real_target):
        try:
            os.remove(real_target)
        except OSError:
            pass


def delete_stale_media_and_thumbnail(old_media_name: str) -> None:
    """Delete an obsolete media file and its `_thumb.webp` sidecar safely across local or S3 storage."""
    if not old_media_name or "\x00" in old_media_name:
        return

    thumb_name = thumb_sidecar_name(old_media_name)

    if getattr(settings, "USE_S3_STORAGE", False):
        norm_name = old_media_name.replace("\\", "/").lstrip("/")
        norm_thumb = thumb_name.replace("\\", "/").lstrip("/")
        if ".." in norm_name.split("/"):
            return
        for key in (norm_name, norm_thumb):
            try:
                default_storage.delete(key)
            except Exception:
                pass
        return

    media_root = getattr(settings, "MEDIA_ROOT", None)
    if not media_root:
        return

    real_media_root = os.path.realpath(str(media_root))
    _delete_local_media_file_safely(real_media_root, old_media_name)
    _delete_local_media_file_safely(real_media_root, thumb_name)

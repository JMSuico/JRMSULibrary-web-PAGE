# [Layer: Helpers] — image_optimizer_helper.py
# Pillow-based image optimization and companion thumbnail generation.

import logging
import os
import tempfile
from io import BytesIO
from typing import Optional

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)


class ImageOptimizerHelper:
    """Compresses uploaded raster images to WebP and manages local disk thumbnails."""

    RASTER_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    INPLACE_RASTER_EXTENSIONS = {'.jpg', '.jpeg', '.png'}

    DEFAULT_MAX_WIDTH = 1200
    DEFAULT_MAX_HEIGHT = 1200
    DEFAULT_QUALITY = 82

    THUMB_MAX_WIDTH = 400
    THUMB_MAX_HEIGHT = 400
    THUMB_QUALITY = 78

    INPLACE_MAX_BYTES = 350 * 1024
    INPLACE_JPEG_QUALITY = 82

    _RESAMPLE_LANCZOS = getattr(getattr(Image, 'Resampling', Image), 'LANCZOS')

    @staticmethod
    def _safe_seek_zero(file_obj) -> None:
        if hasattr(file_obj, 'seek'):
            try:
                file_obj.seek(0)
            except (AttributeError, OSError, ValueError):
                pass

    @classmethod
    def _prepare_image(cls, img: Image.Image, max_width: int, max_height: int) -> Image.Image:
        """Normalize EXIF orientation, color mode, and dimensions."""
        img = ImageOps.exif_transpose(img)
        if getattr(img, 'is_animated', False) and getattr(img, 'n_frames', 1) > 1:
            img.seek(0)

        has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
        target_mode = 'RGBA' if has_alpha else 'RGB'
        if img.mode != target_mode:
            img = img.convert(target_mode)

        if img.width > max_width or img.height > max_height:
            img.thumbnail((max_width, max_height), cls._RESAMPLE_LANCZOS)

        return img

    @classmethod
    def optimize_uploaded_image(
        cls,
        uploaded_file,
        max_width: int = DEFAULT_MAX_WIDTH,
        max_height: int = DEFAULT_MAX_HEIGHT,
        quality: int = DEFAULT_QUALITY,
    ):
        """
        Resize and convert an uploaded raster image to compressed WebP ContentFile.
        Returns None, SVGs, or unreadable/corrupted inputs untouched without raising.
        """
        if uploaded_file is None:
            return None

        original_name = getattr(uploaded_file, 'name', '') or 'image'
        base_name = os.path.basename(original_name)
        stem, ext = os.path.splitext(base_name)
        stem = stem or 'image'

        if ext.lower() == '.svg':
            cls._safe_seek_zero(uploaded_file)
            return uploaded_file

        try:
            cls._safe_seek_zero(uploaded_file)
            with Image.open(uploaded_file) as img:
                prepared = cls._prepare_image(img, max_width, max_height)
                buffer = BytesIO()
                prepared.save(buffer, format='WEBP', quality=quality, method=4)

            cls._safe_seek_zero(uploaded_file)
            return ContentFile(buffer.getvalue(), name=f"{stem}.webp")
        except Exception as exc:
            logger.warning("Image optimization fallback for '%s': %s", original_name, exc)
            cls._safe_seek_zero(uploaded_file)
            return uploaded_file

    @classmethod
    def get_thumbnail_path(cls, image_path: str) -> str:
        stem, _ = os.path.splitext(image_path)
        return f"{stem}_thumb.webp"

    @classmethod
    def thumbnail_needs_update(cls, image_path: str, force: bool = False) -> bool:
        if not image_path or not os.path.isfile(image_path):
            return False
        lower_name = os.path.basename(image_path).lower()
        if lower_name.endswith('_thumb.webp'):
            return False
        _, ext = os.path.splitext(lower_name)
        if ext not in cls.RASTER_EXTENSIONS:
            return False

        thumb_path = cls.get_thumbnail_path(image_path)
        if force or not os.path.exists(thumb_path):
            return True
        try:
            return os.path.getmtime(thumb_path) < os.path.getmtime(image_path)
        except OSError:
            return True

    @classmethod
    def _atomic_save_image(cls, img: Image.Image, target_path: str, image_format: str, **save_kwargs) -> None:
        dir_name = os.path.dirname(target_path) or '.'
        _, ext = os.path.splitext(target_path)
        tmp_path: Optional[str] = None
        try:
            fd, tmp_path = tempfile.mkstemp(prefix='.opt_', suffix=ext or '.tmp', dir=dir_name)
            os.close(fd)
            img.save(tmp_path, format=image_format, **save_kwargs)
            os.replace(tmp_path, target_path)
        except Exception:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
            raise

    @classmethod
    def generate_thumbnail_on_disk(
        cls,
        image_path: str,
        max_width: int = THUMB_MAX_WIDTH,
        max_height: int = THUMB_MAX_HEIGHT,
        quality: int = THUMB_QUALITY,
        force: bool = False,
    ) -> bool:
        """Create or refresh `<stem>_thumb.webp` beside a local raster image."""
        if not cls.thumbnail_needs_update(image_path, force=force):
            return False

        thumb_path = cls.get_thumbnail_path(image_path)
        try:
            with Image.open(image_path) as img:
                prepared = cls._prepare_image(img, max_width, max_height)
                cls._atomic_save_image(prepared, thumb_path, 'WEBP', quality=quality, method=4)
            return True
        except Exception as exc:
            logger.warning("Failed to generate thumbnail for '%s': %s", image_path, exc)
            return False

    @classmethod
    def ensure_thumbnail_for_field(
        cls,
        field_file,
        max_width: int = THUMB_MAX_WIDTH,
        max_height: int = THUMB_MAX_HEIGHT,
        quality: int = THUMB_QUALITY,
    ) -> Optional[str]:
        """Generate a companion local thumbnail for a Django FieldFile when using local storage."""
        if not field_file or not getattr(field_file, 'name', None):
            return None
        if getattr(settings, 'USE_S3_STORAGE', False):
            return None

        try:
            local_path = field_file.path
        except (NotImplementedError, ValueError, AttributeError):
            return None

        if cls.generate_thumbnail_on_disk(
            local_path,
            max_width=max_width,
            max_height=max_height,
            quality=quality,
        ):
            return cls.get_thumbnail_path(local_path)
        return None

    @classmethod
    def optimize_existing_file_in_place(
        cls,
        image_path: str,
        max_width: int = DEFAULT_MAX_WIDTH,
        max_height: int = DEFAULT_MAX_HEIGHT,
        max_bytes: int = INPLACE_MAX_BYTES,
        dry_run: bool = False,
    ) -> dict:
        """
        Resize/recompress oversized `.jpg`/`.jpeg`/`.png` files in-place while preserving exact filename.
        Returns a status dict: {"optimized": bool, "before_bytes": int, "after_bytes": int, "reason": str}.
        """
        if not image_path or not os.path.isfile(image_path):
            return {"optimized": False, "before_bytes": 0, "after_bytes": 0, "reason": "missing"}

        ext = os.path.splitext(image_path)[1].lower()
        orig_size = os.path.getsize(image_path)
        if ext not in cls.INPLACE_RASTER_EXTENSIONS:
            return {"optimized": False, "before_bytes": orig_size, "after_bytes": orig_size, "reason": "non-target-ext"}

        try:
            with Image.open(image_path) as img:
                transposed = ImageOps.exif_transpose(img)
                if getattr(transposed, 'is_animated', False) and getattr(transposed, 'n_frames', 1) > 1:
                    transposed.seek(0)

                oversized_dims = transposed.width > max_width or transposed.height > max_height
                oversized_bytes = orig_size > max_bytes
                if not oversized_dims and not oversized_bytes:
                    return {"optimized": False, "before_bytes": orig_size, "after_bytes": orig_size, "reason": "within-limits"}

                if dry_run:
                    return {"optimized": True, "before_bytes": orig_size, "after_bytes": orig_size, "reason": "dry-run"}

                if ext in ('.jpg', '.jpeg'):
                    prepared = transposed.convert('RGB') if transposed.mode != 'RGB' else transposed.copy()
                    if oversized_dims:
                        prepared.thumbnail((max_width, max_height), cls._RESAMPLE_LANCZOS)
                    image_format = 'JPEG'
                    save_kwargs = {"quality": cls.INPLACE_JPEG_QUALITY, "optimize": True, "progressive": True}
                else:
                    has_alpha = transposed.mode in ('RGBA', 'LA') or (
                        transposed.mode == 'P' and 'transparency' in transposed.info
                    )
                    target_mode = 'RGBA' if has_alpha else 'RGB'
                    prepared = transposed.convert(target_mode) if transposed.mode != target_mode else transposed.copy()
                    if oversized_dims:
                        prepared.thumbnail((max_width, max_height), cls._RESAMPLE_LANCZOS)
                    image_format = 'PNG'
                    save_kwargs = {"optimize": True, "compress_level": 9}

                buffer = BytesIO()
                prepared.save(buffer, format=image_format, **save_kwargs)
                new_bytes = buffer.getvalue()

            if len(new_bytes) >= orig_size and not oversized_dims:
                return {"optimized": False, "before_bytes": orig_size, "after_bytes": orig_size, "reason": "no-size-gain"}

            dir_name = os.path.dirname(image_path) or '.'
            tmp_path: Optional[str] = None
            try:
                fd, tmp_path = tempfile.mkstemp(prefix='.opt_', suffix=ext, dir=dir_name)
                with os.fdopen(fd, 'wb') as tmp_file:
                    tmp_file.write(new_bytes)
                os.replace(tmp_path, image_path)
            except Exception:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass
                raise

            return {
                "optimized": True,
                "before_bytes": orig_size,
                "after_bytes": len(new_bytes),
                "reason": "optimized",
            }
        except Exception as exc:
            logger.warning("In-place optimization skipped for '%s': %s", image_path, exc)
            return {"optimized": False, "before_bytes": orig_size, "after_bytes": orig_size, "reason": f"error: {exc}"}

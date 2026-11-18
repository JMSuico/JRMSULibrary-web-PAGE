# [Layer: management/commands] — optimize_existing_media.py
import os

from django.conf import settings
from django.core.management.base import BaseCommand

from Features.Helpers.image_optimizer_helper import ImageOptimizerHelper


class Command(BaseCommand):
    help = (
        "Optimize oversized media raster images in-place (preserving exact filenames) "
        "and generate companion _thumb.webp thumbnails."
    )

    DEFAULT_TARGET_DIRS = (
        "newly_arrived_books",
        "library_interiors",
        "managed_files",
        "personnel",
        "settings",
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Scan and report files that would be optimized or thumbnailed without modifying disk.",
        )

    def handle(self, *args, **options):
        dry_run = bool(options.get("dry_run"))
        media_root = str(settings.MEDIA_ROOT)

        if not os.path.isdir(media_root):
            self.stdout.write(self.style.WARNING(f"MEDIA_ROOT does not exist: {media_root}"))
            return

        scanned = 0
        optimized_count = 0
        thumb_count = 0
        bytes_saved = 0

        mode_label = "[DRY-RUN] " if dry_run else ""

        for subdir in self.DEFAULT_TARGET_DIRS:
            target_dir = os.path.join(media_root, subdir)
            if not os.path.isdir(target_dir):
                continue

            for root, _, files in os.walk(target_dir):
                for filename in sorted(files):
                    lower_name = filename.lower()
                    if lower_name.endswith("_thumb.webp"):
                        continue

                    _, ext = os.path.splitext(lower_name)
                    if ext not in ImageOptimizerHelper.RASTER_EXTENSIONS:
                        continue

                    file_path = os.path.join(root, filename)
                    rel_path = os.path.relpath(file_path, media_root)
                    scanned += 1

                    if ext in ImageOptimizerHelper.INPLACE_RASTER_EXTENSIONS:
                        result = ImageOptimizerHelper.optimize_existing_file_in_place(
                            file_path,
                            dry_run=dry_run,
                        )
                        if result["optimized"]:
                            optimized_count += 1
                            saved = max(0, result["before_bytes"] - result["after_bytes"])
                            bytes_saved += saved
                            self.stdout.write(
                                f"{mode_label}Optimized {rel_path} "
                                f"({result['before_bytes']} -> {result['after_bytes']} bytes)"
                            )

                    if dry_run:
                        if ImageOptimizerHelper.thumbnail_needs_update(file_path):
                            thumb_count += 1
                            self.stdout.write(f"{mode_label}Would generate thumbnail for {rel_path}")
                    else:
                        if ImageOptimizerHelper.generate_thumbnail_on_disk(file_path):
                            thumb_count += 1
                            self.stdout.write(f"Generated thumbnail for {rel_path}")

        saved_kb = bytes_saved / 1024.0
        self.stdout.write(
            self.style.SUCCESS(
                f"{mode_label}Media scan complete: scanned={scanned}, "
                f"optimized={optimized_count}, thumbnails={thumb_count}, "
                f"saved={saved_kb:.1f} KB"
            )
        )

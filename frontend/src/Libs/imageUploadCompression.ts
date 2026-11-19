const MAX_UPLOAD_EDGE_PX = 1280;
const COMPRESS_THRESHOLD_BYTES = 350 * 1024;
const WEBP_OR_JPEG_QUALITY = 0.84;

const COMPRESSIBLE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

/**
 * Downscales oversized raster upload photos client-side (matching backend 1280px bounds)
 * to avoid multi-megabyte Cloudflare/Nginx request buffering and slow Pillow decoding.
 * Always falls back safely to the original file if canvas APIs fail or output isn't smaller.
 */
export async function compressUploadImageIfNeeded(file: File): Promise<File> {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    file.size <= COMPRESS_THRESHOLD_BYTES ||
    !COMPRESSIBLE_MIME_TYPES.has((file.type || '').toLowerCase())
  ) {
    return file;
  }

  let objectUrl: string | null = null;
  try {
    objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode selected image'));
      image.src = objectUrl as string;
    });

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_UPLOAD_EDGE_PX / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), 'image/webp', WEBP_OR_JPEG_QUALITY),
    );
    if (!blob || blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'cover';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: file.lastModified || Date.now(),
    });
  } catch {
    return file;
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

import imageType, { minimumBytes } from 'image-type';

export interface DetectedImageType {
  mimeType: string;
  extension: string;
}

/**
 * Detects the actual image MIME type and extension from file content.
 *
 * iOS browsers often report misleading names/types (e.g. "image.jpg" for a
 * HEIC file). This reads the file's magic bytes via the `image-type` library,
 * which works independently of the browser's File API metadata.
 */
export async function detectImageType(file: File): Promise<DetectedImageType> {
  const buffer = await file.slice(0, minimumBytes).arrayBuffer();
  const type = await imageType(new Uint8Array(buffer));

  console.log(JSON.stringify(type, null, 2))

  if (type) {
    return { mimeType: type.mime, extension: type.ext };
  }

  const fallback = file.type || 'application/octet-stream';
  return {
    mimeType: fallback,
    extension: extensionFromMime(fallback),
  };
}

function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mime] || mime.split('/').pop() || 'bin';
}

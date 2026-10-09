

export const MAX_PROJECT_IMAGES = 5;
export const MAX_PROJECT_VIDEOS = 1;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
  "bmp",
];

export const SUPPORTED_VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "ogg",
  "mov",
  "m4v",
  "ogv",
  "quicktime",
];

/**
 * Checks if a given media URL or file path represents a video file.
 */
export function isVideoMedia(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  if (trimmed.startsWith("data:video/")) return true;

  // File extension check (stripping query string and hash)
  const cleanPath = trimmed.split("?")[0].split("#")[0];
  const ext = cleanPath.split(".").pop();
  if (ext && SUPPORTED_VIDEO_EXTENSIONS.includes(ext)) {
    return true;
  }

  return false;
}

/**
 * Checks if a given media URL or file path represents an image file.
 */
export function isImageMedia(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return !isVideoMedia(url);
}

/**
 * Count images and videos in a media list.
 */
export function countMediaTypes(mediaList: string[]): {
  imageCount: number;
  videoCount: number;
} {
  let imageCount = 0;
  let videoCount = 0;

  for (const item of mediaList) {
    if (isVideoMedia(item)) {
      videoCount++;
    } else {
      imageCount++;
    }
  }

  return { imageCount, videoCount };
}

export function validateProjectMedia(mediaList: string[]): {
  valid: boolean;
  error?: string;
  imageCount: number;
  videoCount: number;
} {
  const { imageCount, videoCount } = countMediaTypes(mediaList);

  if (videoCount > MAX_PROJECT_VIDEOS) {
    return {
      valid: false,
      error: `Projects allow at most ${MAX_PROJECT_VIDEOS} video. Please remove extra video(s).`,
      imageCount,
      videoCount,
    };
  }

  if (imageCount > MAX_PROJECT_IMAGES) {
    return {
      valid: false,
      error: `Projects allow a maximum of ${MAX_PROJECT_IMAGES} images. Please remove extra image(s).`,
      imageCount,
      videoCount,
    };
  }

  return {
    valid: true,
    imageCount,
    videoCount,
  };
}

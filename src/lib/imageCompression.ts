/**
 * Client-side image compression and resizing utility.
 * Resizes large camera photos (e.g. 4K, 5-15MB) to web-optimized dimensions (e.g. max 1600px)
 * and converts to WebP/JPEG at ~80% quality.
 *
 * This reduces payload size by ~90-95% (typically 100KB - 250KB per image),
 * preventing HTTP 413 (Payload Too Large) errors in Nginx and keeping database records lightweight.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<CompressionResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Selected file is not an image"));
    }

    // Keep SVG untouched as vector graphics don't compress via canvas
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          dataUrl: result,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image preview"));
      img.onload = () => {
        let { width, height } = img;

        // Scale down keeping aspect ratio if larger than bounds
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const rawResult = e.target?.result as string;
          return resolve({
            dataUrl: rawResult,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
          });
        }

        // Draw with high smoothing quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first (modern, highly compressed)
        let mimeType = "image/webp";
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Fallback to JPEG if browser doesn't export WebP (e.g. some older browsers fallback to PNG)
        if (dataUrl.startsWith("data:image/png") && file.type !== "image/png") {
          mimeType = "image/jpeg";
          dataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Approximate byte size of base64 data URL
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);
        const compressionRatio =
          file.size > 0
            ? Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100))
            : 0;

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
          compressionRatio,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. "150 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

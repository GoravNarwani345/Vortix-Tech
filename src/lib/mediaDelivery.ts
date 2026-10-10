import { NextResponse } from "next/server";
import fs from "fs/promises";
import nodeFs from "fs";
import path from "path";
import { Readable } from "stream";

export const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".ogv": "video/ogg",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
};

export async function handleMediaDelivery(
  req: Request,
  pathSegments?: string[]
): Promise<Response> {
  try {
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const targetPath = path.resolve(uploadDir, ...pathSegments);

    // Security: Path traversal protection
    if (!targetPath.startsWith(uploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let stat;
    try {
      stat = await fs.stat(targetPath);
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!stat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileSize = stat.size;
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const rangeHeader = req.headers.get("range");

    // Handle HTTP Range Requests (Essential for HTML5 Video streaming and seeking)
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || start >= fileSize || (parts[1] && end >= fileSize) || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const nodeStream = nodeFs.createReadStream(targetPath, { start, end });
      const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Full file response (Images and initial media loads)
    const nodeStream = nodeFs.createReadStream(targetPath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to deliver media resource",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

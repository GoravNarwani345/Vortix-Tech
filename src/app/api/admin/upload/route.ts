import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { isVideoMedia } from "@/lib/mediaHelper";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Max 100MB per video, 25MB per image
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // 1. Chunked Streaming Upload Handler (Bypasses all 413 reverse proxy / server limits)
    const uploadId = formData.get("uploadId") as string | null;
    const chunkIndexStr = formData.get("chunkIndex") as string | null;
    const totalChunksStr = formData.get("totalChunks") as string | null;
    const chunkFile = formData.get("file");
    const originalFileName =
      (formData.get("fileName") as string | null) ||
      (chunkFile instanceof File ? chunkFile.name : "upload");

    if (
      uploadId &&
      chunkIndexStr !== null &&
      totalChunksStr !== null &&
      chunkFile instanceof File
    ) {
      // Validate session ID to prevent directory traversal
      if (!/^[a-zA-Z0-9_-]{10,80}$/.test(uploadId)) {
        return NextResponse.json(
          { error: "Invalid upload session identifier" },
          { status: 400 }
        );
      }

      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);

      if (
        isNaN(chunkIndex) ||
        isNaN(totalChunks) ||
        chunkIndex < 0 ||
        chunkIndex >= totalChunks
      ) {
        return NextResponse.json(
          { error: "Invalid chunk sequencing parameters" },
          { status: 400 }
        );
      }

      const chunksDir = path.join(uploadDir, ".chunks");
      await fs.mkdir(chunksDir, { recursive: true });

      const partFilePath = path.join(chunksDir, `${uploadId}.part`);
      const chunkBytes = await chunkFile.arrayBuffer();

      if (chunkIndex === 0) {
        await fs.writeFile(partFilePath, Buffer.from(chunkBytes));
      } else {
        await fs.appendFile(partFilePath, Buffer.from(chunkBytes));
      }

      // On final chunk, validate bounds and atomically promote to permanent uploads
      if (chunkIndex === totalChunks - 1) {
        const isVid =
          isVideoMedia(originalFileName) || chunkFile.type.startsWith("video/");
        const isImg = !isVid;

        const stat = await fs.stat(partFilePath);
        if (isVid && stat.size > MAX_VIDEO_SIZE) {
          await fs.unlink(partFilePath).catch(() => {});
          return NextResponse.json(
            { error: `Video "${originalFileName}" exceeds the 100MB limit.` },
            { status: 400 }
          );
        }
        if (isImg && stat.size > MAX_IMAGE_SIZE) {
          await fs.unlink(partFilePath).catch(() => {});
          return NextResponse.json(
            { error: `Image "${originalFileName}" exceeds the 25MB limit.` },
            { status: 400 }
          );
        }

        let targetExt = path.extname(originalFileName).toLowerCase();
        if (isVid) {
          if (targetExt === ".webm") targetExt = ".webm";
          else if (targetExt === ".mov") targetExt = ".mov";
          else if (targetExt === ".ogg") targetExt = ".ogg";
          else targetExt = targetExt || ".mp4";
        } else {
          if (targetExt === ".webp") targetExt = ".webp";
          else if (targetExt === ".svg") targetExt = ".svg";
          else if (targetExt === ".png") targetExt = ".png";
          else if (targetExt === ".gif") targetExt = ".gif";
          else targetExt = targetExt || ".jpg";
        }

        const safeBaseName = path
          .basename(originalFileName, path.extname(originalFileName))
          .replace(/[^a-zA-Z0-9-_]/g, "_")
          .slice(0, 40);

        const secureId = crypto.randomUUID();
        const fileName = `${Date.now()}-${secureId}-${safeBaseName}${targetExt}`;
        const finalFilePath = path.join(uploadDir, fileName);

        await fs.rename(partFilePath, finalFilePath);

        return NextResponse.json({
          success: true,
          completed: true,
          files: [
            {
              url: `/uploads/${fileName}`,
              name: originalFileName,
              type: chunkFile.type,
              size: stat.size,
            },
          ],
        });
      }

      return NextResponse.json({
        success: true,
        completed: false,
        chunkIndex,
        totalChunks,
      });
    }

    // 2. Standard Single-Request Upload Handler (for small assets <= 1MB)
    const files: File[] = [];
    const filesFromList = formData.getAll("files");
    const singleFile = formData.get("file");

    if (filesFromList.length > 0) {
      for (const item of filesFromList) {
        if (item instanceof File) files.push(item);
      }
    } else if (singleFile instanceof File) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided for upload" },
        { status: 400 }
      );
    }

    const uploadedResults: Array<{
      url: string;
      name: string;
      type: string;
      size: number;
    }> = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        return NextResponse.json(
          {
            error: `Unsupported file type "${file.type || file.name}". Only images and videos are supported.`,
          },
          { status: 400 }
        );
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          {
            error: `Video "${file.name}" exceeds the 100MB limit.`,
          },
          { status: 400 }
        );
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            error: `Image "${file.name}" exceeds the 25MB limit.`,
          },
          { status: 400 }
        );
      }

      // Preserve accurate extension matching MIME type
      let targetExt = path.extname(file.name).toLowerCase();
      if (isImage) {
        if (file.type === "image/svg+xml" || targetExt === ".svg") {
          targetExt = ".svg";
        } else if (file.type === "image/webp" || targetExt === ".webp") {
          targetExt = ".webp";
        } else if (file.type === "image/png" || targetExt === ".png") {
          targetExt = ".png";
        } else if (file.type === "image/gif" || targetExt === ".gif") {
          targetExt = ".gif";
        } else if (file.type === "image/jpeg" || targetExt === ".jpg" || targetExt === ".jpeg") {
          targetExt = ".jpg";
        } else {
          targetExt = targetExt || ".webp";
        }
      } else if (isVideo) {
        if (file.type === "video/webm" || targetExt === ".webm") {
          targetExt = ".webm";
        } else if (file.type === "video/ogg" || targetExt === ".ogg") {
          targetExt = ".ogg";
        } else if (file.type === "video/quicktime" || targetExt === ".mov") {
          targetExt = ".mov";
        } else {
          targetExt = targetExt || ".mp4";
        }
      }

      const safeBaseName = path
        .basename(file.name, path.extname(file.name))
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .slice(0, 40);

      // Cryptographically secure unique identifier
      const secureId = crypto.randomUUID();
      const fileName = `${Date.now()}-${secureId}-${safeBaseName}${targetExt}`;
      const filePath = path.join(uploadDir, fileName);

      const bytes = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(bytes));

      uploadedResults.push({
        url: `/uploads/${fileName}`,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      completed: true,
      files: uploadedResults,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : "Unknown upload error",
      },
      { status: 500 }
    );
  }
}

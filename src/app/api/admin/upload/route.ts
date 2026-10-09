import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Max 100MB per video, 25MB per image
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    
    // Support either multiple files under "files" or single file under "file"
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

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

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

      // Standardize extension: all raster images saved as .webp, vector as .svg, video as web format
      let targetExt = path.extname(file.name).toLowerCase();
      if (isImage) {
        targetExt = file.type === "image/svg+xml" || targetExt === ".svg" ? ".svg" : ".webp";
      } else if (isVideo) {
        targetExt = targetExt === ".webm" ? ".webm" : targetExt === ".ogg" ? ".ogg" : ".mp4";
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

import prisma from "./prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

export async function migrateProjectsToWebp(): Promise<{
  inspected: number;
  converted: number;
  errors: string[];
}> {
  const projects = await prisma.project.findMany();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  let totalConverted = 0;
  const errors: string[] = [];

  for (const project of projects) {
    if (!project.images || project.images.length === 0) continue;

    let projectModified = false;
    const updatedImages: string[] = [];

    for (let i = 0; i < project.images.length; i++) {
      const img = project.images[i];

      // 1. If Base64 image
      if (img.startsWith("data:image/")) {
        try {
          const base64Data = img.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");
          const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

          const fileName = `${Date.now()}-${crypto.randomUUID()}-migrated.webp`;
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, webpBuffer);

          updatedImages.push(`/uploads/${fileName}`);
          projectModified = true;
          totalConverted++;
        } catch (err) {
          errors.push(
            `Failed to convert base64 image in project ${project.title}: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          updatedImages.push(img);
        }
      }
      // 2. If local upload that is PNG or JPG
      else if (
        img.startsWith("/uploads/") &&
        (img.endsWith(".png") ||
          img.endsWith(".jpg") ||
          img.endsWith(".jpeg") ||
          img.endsWith(".bmp"))
      ) {
        try {
          const originalDiskPath = path.join(
            process.cwd(),
            "public",
            img.replace(/^\//, "")
          );
          const newFileName = img
            .replace(/^\/uploads\//, "")
            .replace(/\.[^.]+$/, ".webp");
          const targetDiskPath = path.join(uploadDir, newFileName);

          await sharp(originalDiskPath).webp({ quality: 80 }).toFile(targetDiskPath);
          updatedImages.push(`/uploads/${newFileName}`);
          projectModified = true;
          totalConverted++;
        } catch (err) {
          errors.push(
            `Failed to convert local file ${img}: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          updatedImages.push(img);
        }
      } else {
        // Already WebP, SVG, or video file
        updatedImages.push(img);
      }
    }

    if (projectModified) {
      await prisma.project.update({
        where: { id: project.id },
        data: { images: updatedImages },
      });
    }
  }

  return {
    inspected: projects.length,
    converted: totalConverted,
    errors,
  };
}

const isMainModule = Boolean(
  (import.meta as unknown as { main?: boolean }).main ||
    (typeof process !== "undefined" &&
      process.argv[1] &&
      process.argv[1].includes("migrateImagesToWebp"))
);

if (isMainModule) {
  migrateProjectsToWebp()
    .then((res) => {
      console.log("Migration complete:", JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

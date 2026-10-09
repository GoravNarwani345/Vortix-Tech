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

export async function convertDiskUploadsToWebp(): Promise<{
  inspected: number;
  converted: number;
  errors: string[];
}> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  let converted = 0;
  let inspected = 0;
  const errors: string[] = [];

  try {
    const files = await fs.readdir(uploadDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".bmp"].includes(ext)) {
        inspected++;
        const baseName = path.basename(file, ext);
        const inputPath = path.join(uploadDir, file);
        const outputPath = path.join(uploadDir, `${baseName}.webp`);

        try {
          await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
          converted++;
        } catch (e) {
          errors.push(
            `Failed to convert disk file ${file}: ${
              e instanceof Error ? e.message : "Unknown error"
            }`
          );
        }
      }
    }
  } catch (err) {
    errors.push(
      `Failed to read uploads directory: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }

  return { inspected, converted, errors };
}

const isMainModule = Boolean(
  (import.meta as unknown as { main?: boolean }).main ||
    (typeof process !== "undefined" &&
      process.argv[1] &&
      process.argv[1].includes("migrateImagesToWebp"))
);

if (isMainModule) {
  Promise.all([convertDiskUploadsToWebp(), migrateProjectsToWebp()])
    .then(([diskRes, dbRes]) => {
      console.log("=========================================");
      console.log("   VORTIX TECH - WEBP MIGRATION COMPLETE ");
      console.log("=========================================");
      console.log(`Disk Files Converted:     ${diskRes.converted} / ${diskRes.inspected}`);
      console.log(`Database Projects Checked: ${dbRes.inspected}`);
      console.log(`Database Images Updated:  ${dbRes.converted}`);
      if (diskRes.errors.length > 0 || dbRes.errors.length > 0) {
        console.warn("Errors encountered:", [...diskRes.errors, ...dbRes.errors]);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

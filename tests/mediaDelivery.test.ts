import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { handleMediaDelivery } from "../src/lib/mediaDelivery";
import fs from "fs/promises";
import path from "path";

describe("Dynamic Media Delivery & Streaming Service", () => {
  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  const testFileName = "test-sample-image.webp";
  const testFilePath = path.join(uploadDir, testFileName);
  const sampleData = Buffer.from("RIFF....WEBPVP8 ...test-content...");

  beforeAll(async () => {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(testFilePath, sampleData);
  });

  afterAll(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch {
      // Cleanup
    }
  });

  it("should return 404 for missing media files", async () => {
    const req = new Request("http://localhost:3000/uploads/non-existent-file.webp");
    const res = await handleMediaDelivery(req, ["non-existent-file.webp"]);

    expect(res.status).toBe(404);
  });

  it("should block path traversal attempts with 403 Forbidden", async () => {
    const req = new Request("http://localhost:3000/uploads/../../package.json");
    const res = await handleMediaDelivery(req, ["..", "..", "package.json"]);

    expect(res.status).toBe(403);
  });

  it("should serve existing image files with status 200, Content-Type, and Cache-Control", async () => {
    const req = new Request(`http://localhost:3000/uploads/${testFileName}`);
    const res = await handleMediaDelivery(req, [testFileName]);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
  });

  it("should support HTTP Range requests with status 206 Partial Content", async () => {
    const req = new Request(`http://localhost:3000/uploads/${testFileName}`, {
      headers: {
        range: "bytes=0-10",
      },
    });
    const res = await handleMediaDelivery(req, [testFileName]);

    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe(`bytes 0-10/${sampleData.length}`);
    expect(res.headers.get("Content-Length")).toBe("11");
    expect(res.headers.get("Content-Type")).toBe("image/webp");
  });
});

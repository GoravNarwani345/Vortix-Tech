import { describe, expect, it } from "bun:test";
import { formatBytes } from "../src/lib/imageCompression";

describe("Image Compression Utility", () => {
  it("should format bytes to readable units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
  });
});

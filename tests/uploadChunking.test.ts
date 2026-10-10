import { describe, expect, it } from "bun:test";

describe("Chunk Slicing & Reassembly Integrity", () => {
  it("should accurately slice and reconstruct a multi-megabyte buffer across 768KB boundaries", () => {
    // Simulate a 2.83 MB payload (2,974,093 bytes) like the user's video
    const totalBytes = 2974093;
    const originalBuffer = Buffer.alloc(totalBytes);
    for (let i = 0; i < totalBytes; i++) {
      originalBuffer[i] = i % 256;
    }

    const CHUNK_SIZE = 768 * 1024;
    const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);
    expect(totalChunks).toBe(4);

    const assembledChunks: Buffer[] = [];

    for (let c = 0; c < totalChunks; c++) {
      const start = c * CHUNK_SIZE;
      const end = Math.min(totalBytes, start + CHUNK_SIZE);
      const slice = originalBuffer.subarray(start, end);

      expect(slice.length).toBeLessThanOrEqual(CHUNK_SIZE);
      assembledChunks.push(slice);
    }

    const reconstructedBuffer = Buffer.concat(assembledChunks);
    expect(reconstructedBuffer.length).toBe(totalBytes);
    expect(reconstructedBuffer.equals(originalBuffer)).toBe(true);
  });
});

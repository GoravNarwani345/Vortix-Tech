import { describe, it, expect } from "bun:test";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

describe("Rate Limit Module", () => {
  it("should allow requests under the limit", () => {
    const key = `test_ip_${Date.now()}`;
    const res1 = rateLimit(key, 3, 5000);
    expect(res1.ok).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(key, 3, 5000);
    expect(res2.ok).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(key, 3, 5000);
    expect(res3.ok).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests exceeding the limit", () => {
    const key = `test_exceed_${Date.now()}`;
    rateLimit(key, 2, 5000);
    rateLimit(key, 2, 5000);

    const blocked = rateLimit(key, 2, 5000);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("getClientIp should parse x-forwarded-for header", () => {
    const req = new Request("http://localhost:3000", {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });
});

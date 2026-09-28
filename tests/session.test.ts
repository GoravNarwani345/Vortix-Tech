import { describe, it, expect } from "bun:test";
import {
  constantTimeEqual,
  createSession,
  verifySession,
} from "@/lib/session";

describe("Session & Security Module", () => {
  it("constantTimeEqual should accurately compare strings", async () => {
    expect(await constantTimeEqual("test1234", "test1234")).toBe(true);
    expect(await constantTimeEqual("test1234", "test1235")).toBe(false);
    expect(await constantTimeEqual("short", "longer_string")).toBe(false);
    expect(await constantTimeEqual("", "")).toBe(true);
  });

  it("should create and verify a signed admin session token", async () => {
    process.env.ADMIN_SESSION_SECRET = "super_secure_unit_testing_secret_key_123456";
    const token = await createSession();
    expect(token).toBeDefined();
    expect(token.includes(".")).toBe(true);

    const isValid = await verifySession(token);
    expect(isValid).toBe(true);
  });

  it("should reject tampered or invalid session tokens", async () => {
    process.env.ADMIN_SESSION_SECRET = "super_secure_unit_testing_secret_key_123456";
    const token = await createSession();
    const tampered = token + "corrupted";

    expect(await verifySession(tampered)).toBe(false);
    expect(await verifySession("")).toBe(false);
    expect(await verifySession(undefined)).toBe(false);
    expect(await verifySession("invalid.token.structure")).toBe(false);
  });
});

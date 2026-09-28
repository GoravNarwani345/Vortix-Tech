import { describe, it, expect, beforeEach } from "bun:test";
import {
  maskSecret,
  getSetting,
  updateSettings,
  getStoredSettings,
} from "@/lib/settings";

describe("Settings Module", () => {
  it("should mask secrets correctly", () => {
    expect(maskSecret("")).toBe("");
    expect(maskSecret("short")).toBe("••••••");
    expect(maskSecret("AIzaSy1234567890abcdef")).toBe("AIz••••••••def");
  });

  it("should return fallback default values when key is not stored", async () => {
    // Test fallback on unconfigured key
    const val = await getSetting("AI_MAX_TOKENS" as any, 1200);
    expect(val).toBe(1200);

    const fallbackEmail = await getSetting("CONTACT_EMAIL" as any, "default@vortixtech.com");
    expect(fallbackEmail).toBeDefined();
  });

  it("should update and retrieve stored settings", async () => {
    await updateSettings({
      ADMIN_EMAIL: "admin@vortixtech.com",
      AI_TEMPERATURE: 0.85,
    });

    const email = await getSetting("ADMIN_EMAIL");
    expect(email).toBe("admin@vortixtech.com");

    const temp = await getSetting("AI_TEMPERATURE");
    expect(temp).toBe(0.85);
  });

  it("should ignore masked placeholder strings when updating", async () => {
    await updateSettings({
      GEMINI_API_KEY: "real_secret_key_12345",
    });

    // Attempt to update with masked string
    await updateSettings({
      GEMINI_API_KEY: "••••••••••••",
    });

    const key = await getSetting("GEMINI_API_KEY");
    expect(key).toBe("real_secret_key_12345");
  });
});

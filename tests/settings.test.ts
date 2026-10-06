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

  it("should update and retrieve hero customization settings", async () => {
    await updateSettings({
      HERO_BADGE: "Full-Stack Engineering · AI Automation · CRM Pipelines · Cloud Systems",
      HERO_TITLE_PREFIX: "We Build",
      HERO_TITLE_ACCENT: "Digital Systems",
      HERO_TITLE_SUFFIX: "That Drive Real Growth",
      HERO_ROTATING_WORDS: "Full-Stack Web & Mobile Apps, AI Agents, CRM Pipelines",
      HERO_PRIMARY_CTA: "Get a Quote",
    });

    expect(await getSetting("HERO_TITLE_ACCENT")).toBe("Digital Systems");
    expect(await getSetting("HERO_PRIMARY_CTA")).toBe("Get a Quote");
    expect(await getSetting("HERO_BADGE")).toBe(
      "Full-Stack Engineering · AI Automation · CRM Pipelines · Cloud Systems"
    );
  });
});

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getStoredSettings,
  updateSettings,
  maskSecret,
  AppSettings,
} from "@/lib/settings";
import { syncAiKnowledge } from "@/lib/aiKnowledge";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stored = await getStoredSettings();

    // Check effective values (stored vs env)
    const effectiveAdminEmail =
      stored.ADMIN_EMAIL || process.env.ADMIN_EMAIL || "info@thevortixtech.com";
    const effectiveContactEmail =
      stored.CONTACT_EMAIL || process.env.CONTACT_EMAIL || "info@thevortixtech.com";
    const rawGeminiKey =
      stored.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    const rawResendKey =
      stored.RESEND_API_KEY || process.env.RESEND_API_KEY || "";
    const rawCronSecret =
      stored.CRON_SECRET || process.env.CRON_SECRET || "";

    const publicSettings = {
      adminEmail: effectiveAdminEmail,
      hasAdminPassword: Boolean(
        stored.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD
      ),
      geminiApiKeyMasked: maskSecret(rawGeminiKey),
      hasGeminiApiKey: Boolean(rawGeminiKey),
      resendApiKeyMasked: maskSecret(rawResendKey),
      hasResendApiKey: Boolean(rawResendKey),
      contactEmail: effectiveContactEmail,
      cronSecretMasked: maskSecret(rawCronSecret),
      hasCronSecret: Boolean(rawCronSecret),
      aiModel: stored.AI_MODEL || "gemini-3.8-flash",
      aiTemperature: stored.AI_TEMPERATURE ?? 0.7,
      aiMaxTokens: stored.AI_MAX_TOKENS ?? 800,
      aiCustomInstructions: stored.AI_CUSTOM_INSTRUCTIONS || "",
      aiIncludeServices: stored.AI_INCLUDE_SERVICES ?? true,
      aiIncludePortfolio: stored.AI_INCLUDE_PORTFOLIO ?? true,
      aiIncludeBlog: stored.AI_INCLUDE_BLOG ?? true,
      aiIncludeTestimonials: stored.AI_INCLUDE_TESTIMONIALS ?? true,
      aiIncludeGuide: stored.AI_INCLUDE_GUIDE ?? true,
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: Partial<AppSettings> = {};

    if (typeof body.adminEmail === "string" && body.adminEmail.trim()) {
      updates.ADMIN_EMAIL = body.adminEmail.trim();
    }

    if (typeof body.adminPassword === "string" && body.adminPassword.trim()) {
      if (body.adminPassword.length < 6) {
        return NextResponse.json(
          { error: "Admin password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updates.ADMIN_PASSWORD = body.adminPassword.trim();
    }

    if (typeof body.geminiApiKey === "string" && body.geminiApiKey.trim()) {
      updates.GEMINI_API_KEY = body.geminiApiKey.trim();
    }

    if (typeof body.resendApiKey === "string" && body.resendApiKey.trim()) {
      updates.RESEND_API_KEY = body.resendApiKey.trim();
    }

    if (typeof body.contactEmail === "string" && body.contactEmail.trim()) {
      updates.CONTACT_EMAIL = body.contactEmail.trim();
    }

    if (typeof body.cronSecret === "string" && body.cronSecret.trim()) {
      updates.CRON_SECRET = body.cronSecret.trim();
    }

    if (typeof body.aiModel === "string") {
      updates.AI_MODEL = body.aiModel;
    }

    if (typeof body.aiTemperature === "number") {
      updates.AI_TEMPERATURE = Math.min(Math.max(body.aiTemperature, 0), 1.5);
    }

    if (typeof body.aiMaxTokens === "number") {
      updates.AI_MAX_TOKENS = Math.min(Math.max(body.aiMaxTokens, 100), 4000);
    }

    if (typeof body.aiCustomInstructions === "string") {
      updates.AI_CUSTOM_INSTRUCTIONS = body.aiCustomInstructions;
    }

    if (typeof body.aiIncludeServices === "boolean") {
      updates.AI_INCLUDE_SERVICES = body.aiIncludeServices;
    }

    if (typeof body.aiIncludePortfolio === "boolean") {
      updates.AI_INCLUDE_PORTFOLIO = body.aiIncludePortfolio;
    }

    if (typeof body.aiIncludeBlog === "boolean") {
      updates.AI_INCLUDE_BLOG = body.aiIncludeBlog;
    }

    if (typeof body.aiIncludeTestimonials === "boolean") {
      updates.AI_INCLUDE_TESTIMONIALS = body.aiIncludeTestimonials;
    }

    if (typeof body.aiIncludeGuide === "boolean") {
      updates.AI_INCLUDE_GUIDE = body.aiIncludeGuide;
    }

    await updateSettings(updates);

    // Refresh AI knowledge cache with updated settings in background
    void syncAiKnowledge("manual");

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

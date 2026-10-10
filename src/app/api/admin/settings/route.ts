import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getStoredSettings,
  updateSettings,
  maskSecret,
  AppSettings,
} from "@/lib/settings";
import { syncAiKnowledge } from "@/lib/aiKnowledge";
import { getAllDailyQuotas } from "@/lib/workloadQuota";

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
    const rawAgentRouterKey =
      stored.AGENTROUTER_API_KEY || process.env.AGENTROUTER_API_KEY || "";
    const effectiveAgentRouterBaseUrl =
      stored.AGENTROUTER_BASE_URL || process.env.AGENTROUTER_BASE_URL || "https://agentrouter.org/v1";
    const effectiveAgentRouterModel =
      stored.AGENTROUTER_MODEL || process.env.AGENTROUTER_MODEL || "deepseek-v4-flash";
    const rawResendKey =
      stored.RESEND_API_KEY || process.env.RESEND_API_KEY || "";
    const rawCronSecret =
      stored.CRON_SECRET || process.env.CRON_SECRET || "";
    const rawImageKey =
      stored.IMAGE_API_KEY ||
      process.env.IMAGE_API_KEY ||
      process.env.NEW_API_KEY ||
      "";
    const effectiveImageBaseUrl =
      stored.IMAGE_BASE_URL ||
      process.env.IMAGE_BASE_URL ||
      "https://api.hcnsec.cn/v1";
    const effectiveImageModel =
      stored.IMAGE_MODEL || process.env.IMAGE_MODEL || "step-image-edit-2";

    const publicSettings = {
      adminEmail: effectiveAdminEmail,
      hasAdminPassword: Boolean(
        stored.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD
      ),
      geminiApiKeyMasked: maskSecret(rawGeminiKey),
      hasGeminiApiKey: Boolean(rawGeminiKey),
      agentRouterApiKeyMasked: maskSecret(rawAgentRouterKey),
      hasAgentRouterApiKey: Boolean(rawAgentRouterKey),
      agentRouterBaseUrl: effectiveAgentRouterBaseUrl,
      agentRouterModel: effectiveAgentRouterModel,
      agentRouterReasoningEffort: stored.AGENTROUTER_REASONING_EFFORT || process.env.AGENTROUTER_REASONING_EFFORT || "medium",
      aiProvider: stored.AI_PROVIDER || "agentrouter",
      aiPrimaryProvider: stored.AI_PRIMARY_PROVIDER || "agentrouter",
      aiSecondaryProvider: stored.AI_SECONDARY_PROVIDER || (rawGeminiKey ? "gemini" : "none"),
      // Per-Task Specialization Routing Matrix
      aiTaskChatProvider: stored.AI_TASK_CHAT_PROVIDER || "default",
      aiTaskChatModel: stored.AI_TASK_CHAT_MODEL || "",
      aiTaskBlogProvider: stored.AI_TASK_BLOG_PROVIDER || "default",
      aiTaskBlogModel: stored.AI_TASK_BLOG_MODEL || "",
      aiTaskResearchProvider: stored.AI_TASK_RESEARCH_PROVIDER || "default",
      aiTaskResearchModel: stored.AI_TASK_RESEARCH_MODEL || "",
      aiTaskAuditProvider: stored.AI_TASK_AUDIT_PROVIDER || "default",
      aiTaskAuditModel: stored.AI_TASK_AUDIT_MODEL || "",
      imageApiKeyMasked: maskSecret(rawImageKey),
      hasImageApiKey: Boolean(rawImageKey),
      imageBaseUrl: effectiveImageBaseUrl,
      imageModel: effectiveImageModel,
      resendApiKeyMasked: maskSecret(rawResendKey),
      hasResendApiKey: Boolean(rawResendKey),
      contactEmail: effectiveContactEmail,
      cronSecretMasked: maskSecret(rawCronSecret),
      hasCronSecret: Boolean(rawCronSecret),
      aiModel: stored.AI_MODEL || "DeepSeek-V4-Flash",
      aiTemperature: stored.AI_TEMPERATURE ?? 0.7,
      aiMaxTokens: stored.AI_MAX_TOKENS ?? 800,
      aiCustomInstructions: stored.AI_CUSTOM_INSTRUCTIONS || "",
      aiIncludeServices: stored.AI_INCLUDE_SERVICES ?? true,
      aiIncludePortfolio: stored.AI_INCLUDE_PORTFOLIO ?? true,
      aiIncludeBlog: stored.AI_INCLUDE_BLOG ?? true,
      aiIncludeTestimonials: stored.AI_INCLUDE_TESTIMONIALS ?? true,
      aiIncludeGuide: stored.AI_INCLUDE_GUIDE ?? true,
      statsProjectsDelivered: stored.STATS_PROJECTS_DELIVERED ?? null,
      statsHappyClients: stored.STATS_HAPPY_CLIENTS ?? null,
      statsTechnologies: stored.STATS_TECHNOLOGIES ?? null,
      statsTeamMembers: stored.STATS_TEAM_MEMBERS ?? null,
      heroBadge: stored.HERO_BADGE || "Full-Stack Engineering · AI Automation · CRM Pipelines · Cloud Systems",
      heroTitlePrefix: stored.HERO_TITLE_PREFIX || "We Build",
      heroTitleAccent: stored.HERO_TITLE_ACCENT || "Digital Systems",
      heroTitleSuffix: stored.HERO_TITLE_SUFFIX || "That Drive Real Growth",
      heroSubtitlePrefix: stored.HERO_SUBTITLE_PREFIX || "We engineer powerful",
      heroRotatingWords: stored.HERO_ROTATING_WORDS || "AI Agents & Autonomous Workflows, Full-Stack Web & Mobile Apps, CRM Pipeline Automations, Enterprise n8n & ComfyUI Systems, Cloud Architecture & APIs",
      heroDescription: stored.HERO_DESCRIPTION || "From modern web applications and AI-powered automation to end-to-end CRM pipeline management and cloud infrastructure, Vortix Tech engineers the digital infrastructure that scales your business.",
      heroPrimaryCta: stored.HERO_PRIMARY_CTA || "Get a Quote",
      heroSecondaryCta: stored.HERO_SECONDARY_CTA || "Explore Services",
    };

    const quotas = await getAllDailyQuotas();

    return NextResponse.json({ success: true, settings: publicSettings, quotas });
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

    if (typeof body.agentRouterApiKey === "string" && body.agentRouterApiKey.trim()) {
      updates.AGENTROUTER_API_KEY = body.agentRouterApiKey.trim();
    }

    if (typeof body.agentRouterBaseUrl === "string" && body.agentRouterBaseUrl.trim()) {
      updates.AGENTROUTER_BASE_URL = body.agentRouterBaseUrl.trim();
    }

    if (typeof body.agentRouterModel === "string" && body.agentRouterModel.trim()) {
      updates.AGENTROUTER_MODEL = body.agentRouterModel.trim();
    }

    if (typeof body.agentRouterReasoningEffort === "string") {
      updates.AGENTROUTER_REASONING_EFFORT = body.agentRouterReasoningEffort;
    }

    if (
      typeof body.imageApiKey === "string" &&
      body.imageApiKey.trim() &&
      !body.imageApiKey.includes("•")
    ) {
      updates.IMAGE_API_KEY = body.imageApiKey.trim();
    }

    if (typeof body.imageBaseUrl === "string" && body.imageBaseUrl.trim()) {
      updates.IMAGE_BASE_URL = body.imageBaseUrl.trim();
    }

    if (typeof body.imageModel === "string" && body.imageModel.trim()) {
      updates.IMAGE_MODEL = body.imageModel.trim();
    }

    if (typeof body.aiProvider === "string") {
      updates.AI_PROVIDER = body.aiProvider as "gemini" | "agentrouter";
    }

    if (typeof body.aiPrimaryProvider === "string") {
      updates.AI_PRIMARY_PROVIDER = body.aiPrimaryProvider as "agentrouter" | "gemini";
      updates.AI_PROVIDER = updates.AI_PRIMARY_PROVIDER;
    }

    if (typeof body.aiSecondaryProvider === "string") {
      updates.AI_SECONDARY_PROVIDER = body.aiSecondaryProvider as "gemini" | "agentrouter" | "none";
    }

    // Task-specific routing updates
    if (typeof body.aiTaskChatProvider === "string") {
      updates.AI_TASK_CHAT_PROVIDER = body.aiTaskChatProvider as "default" | "agentrouter" | "gemini";
    }
    if (typeof body.aiTaskChatModel === "string") {
      updates.AI_TASK_CHAT_MODEL = body.aiTaskChatModel.trim();
    }
    if (typeof body.aiTaskBlogProvider === "string") {
      updates.AI_TASK_BLOG_PROVIDER = body.aiTaskBlogProvider as "default" | "agentrouter" | "gemini";
    }
    if (typeof body.aiTaskBlogModel === "string") {
      updates.AI_TASK_BLOG_MODEL = body.aiTaskBlogModel.trim();
    }
    if (typeof body.aiTaskResearchProvider === "string") {
      updates.AI_TASK_RESEARCH_PROVIDER = body.aiTaskResearchProvider as "default" | "agentrouter" | "gemini";
    }
    if (typeof body.aiTaskResearchModel === "string") {
      updates.AI_TASK_RESEARCH_MODEL = body.aiTaskResearchModel.trim();
    }
    if (typeof body.aiTaskAuditProvider === "string") {
      updates.AI_TASK_AUDIT_PROVIDER = body.aiTaskAuditProvider as "default" | "agentrouter" | "gemini";
    }
    if (typeof body.aiTaskAuditModel === "string") {
      updates.AI_TASK_AUDIT_MODEL = body.aiTaskAuditModel.trim();
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

    if (body.statsProjectsDelivered !== undefined) {
      const val = Number(body.statsProjectsDelivered);
      updates.STATS_PROJECTS_DELIVERED = isNaN(val) || val <= 0 ? undefined : val;
    }

    if (body.statsHappyClients !== undefined) {
      const val = Number(body.statsHappyClients);
      updates.STATS_HAPPY_CLIENTS = isNaN(val) || val <= 0 ? undefined : val;
    }

    if (body.statsTechnologies !== undefined) {
      const val = Number(body.statsTechnologies);
      updates.STATS_TECHNOLOGIES = isNaN(val) || val <= 0 ? undefined : val;
    }

    if (body.statsTeamMembers !== undefined) {
      const val = Number(body.statsTeamMembers);
      updates.STATS_TEAM_MEMBERS = isNaN(val) || val <= 0 ? undefined : val;
    }

    if (typeof body.heroBadge === "string") updates.HERO_BADGE = body.heroBadge.trim();
    if (typeof body.heroTitlePrefix === "string") updates.HERO_TITLE_PREFIX = body.heroTitlePrefix.trim();
    if (typeof body.heroTitleAccent === "string") updates.HERO_TITLE_ACCENT = body.heroTitleAccent.trim();
    if (typeof body.heroTitleSuffix === "string") updates.HERO_TITLE_SUFFIX = body.heroTitleSuffix.trim();
    if (typeof body.heroSubtitlePrefix === "string") updates.HERO_SUBTITLE_PREFIX = body.heroSubtitlePrefix.trim();
    if (typeof body.heroRotatingWords === "string") updates.HERO_ROTATING_WORDS = body.heroRotatingWords.trim();
    if (typeof body.heroDescription === "string") updates.HERO_DESCRIPTION = body.heroDescription.trim();
    if (typeof body.heroPrimaryCta === "string") updates.HERO_PRIMARY_CTA = body.heroPrimaryCta.trim();
    if (typeof body.heroSecondaryCta === "string") updates.HERO_SECONDARY_CTA = body.heroSecondaryCta.trim();

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

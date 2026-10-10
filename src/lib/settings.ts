import fs from "fs/promises";
import path from "path";

export type AppSettings = {
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  AGENTROUTER_API_KEY?: string;
  AGENTROUTER_BASE_URL?: string;
  AGENTROUTER_MODEL?: string;
  AGENTROUTER_REASONING_EFFORT?: string;
  GATEWAY_API_KEY?: string;
  GATEWAY_BASE_URL?: string;
  GATEWAY_MODEL?: string;
  AI_PROVIDER?: "gateway" | "agentrouter" | "gemini" | "auto";
  AI_PRIMARY_PROVIDER?: "gateway" | "agentrouter" | "gemini";
  AI_SECONDARY_PROVIDER?: "gemini" | "gateway" | "agentrouter" | "none";
  // Task-specific routing configuration
  AI_TASK_CHAT_PROVIDER?: "default" | "gateway" | "agentrouter" | "gemini";
  AI_TASK_CHAT_MODEL?: string;
  AI_TASK_BLOG_PROVIDER?: "default" | "gateway" | "agentrouter" | "gemini";
  AI_TASK_BLOG_MODEL?: string;
  AI_TASK_RESEARCH_PROVIDER?: "default" | "gateway" | "agentrouter" | "gemini";
  AI_TASK_RESEARCH_MODEL?: string;
  AI_TASK_AUDIT_PROVIDER?: "default" | "gateway" | "agentrouter" | "gemini";
  AI_TASK_AUDIT_MODEL?: string;
  IMAGE_API_KEY?: string;
  IMAGE_BASE_URL?: string;
  IMAGE_MODEL?: string;
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CRON_SECRET?: string;
  AI_MODEL?: string;
  AI_TEMPERATURE?: number;
  AI_MAX_TOKENS?: number;
  AI_CUSTOM_INSTRUCTIONS?: string;
  AI_INCLUDE_SERVICES?: boolean;
  AI_INCLUDE_PORTFOLIO?: boolean;
  AI_INCLUDE_BLOG?: boolean;
  AI_INCLUDE_TESTIMONIALS?: boolean;
  AI_INCLUDE_GUIDE?: boolean;
  STATS_PROJECTS_DELIVERED?: number;
  STATS_HAPPY_CLIENTS?: number;
  STATS_TECHNOLOGIES?: number;
  STATS_TEAM_MEMBERS?: number;
  HERO_BADGE?: string;
  HERO_TITLE_PREFIX?: string;
  HERO_TITLE_ACCENT?: string;
  HERO_TITLE_SUFFIX?: string;
  HERO_SUBTITLE_PREFIX?: string;
  HERO_ROTATING_WORDS?: string;
  HERO_DESCRIPTION?: string;
  HERO_PRIMARY_CTA?: string;
  HERO_SECONDARY_CTA?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "app_settings.json");

// In-memory cache for fast access with 2-second TTL to pick up disk updates immediately
let settingsCache: AppSettings | null = null;
let lastCacheReadTime = 0;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists or cannot create
  }
}

export async function getStoredSettings(forceFresh = false): Promise<AppSettings> {
  const now = Date.now();
  if (!forceFresh && settingsCache && now - lastCacheReadTime < 2000) {
    return { ...settingsCache };
  }

  try {
    await ensureDataDir();
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    settingsCache = JSON.parse(raw);
    lastCacheReadTime = now;
    return { ...settingsCache };
  } catch {
    settingsCache = {};
    lastCacheReadTime = now;
    return {};
  }
}

export async function getSetting<K extends keyof AppSettings>(
  key: K,
  defaultValue?: AppSettings[K]
): Promise<AppSettings[K]> {
  const stored = await getStoredSettings();
  if (stored[key] !== undefined && stored[key] !== "") {
    return stored[key] as AppSettings[K];
  }

  // Fallback to environment variables
  const envVal = process.env[key as string];
  if (envVal !== undefined && envVal !== "") {
    if (typeof defaultValue === "number") {
      const parsed = parseFloat(envVal);
      return (isNaN(parsed) ? defaultValue : parsed) as AppSettings[K];
    }
    if (typeof defaultValue === "boolean") {
      return (envVal === "true" || envVal === "1") as AppSettings[K];
    }
    return envVal as AppSettings[K];
  }

  return defaultValue as AppSettings[K];
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  await ensureDataDir();
  const current = await getStoredSettings();

  // Clean updates - ignore empty password or dummy masked values
  const cleaned: Partial<AppSettings> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null) continue;
    // Don't overwrite secret with masked placeholders
    if (typeof v === "string" && v.startsWith("••••")) continue;
    (cleaned as Record<string, unknown>)[k] = v;
  }

  const merged = { ...current, ...cleaned };
  settingsCache = merged;
  lastCacheReadTime = Date.now();

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  return { ...merged };
}

export function maskSecret(val?: string): string {
  if (!val || val.length === 0) return "";
  if (val.length <= 6) return "••••••";
  return `${val.slice(0, 3)}••••••••${val.slice(-3)}`;
}

import fs from "fs/promises";
import path from "path";

export type AppSettings = {
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  GEMINI_API_KEY?: string;
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
};

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "app_settings.json");

// In-memory cache for fast access
let settingsCache: AppSettings | null = null;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists or cannot create
  }
}

export async function getStoredSettings(): Promise<AppSettings> {
  if (settingsCache) return { ...settingsCache };

  try {
    await ensureDataDir();
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    settingsCache = JSON.parse(raw);
    return { ...settingsCache };
  } catch {
    settingsCache = {};
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

  await fs.writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  return { ...merged };
}

export function maskSecret(val?: string): string {
  if (!val || val.length === 0) return "";
  if (val.length <= 6) return "••••••";
  return `${val.slice(0, 3)}••••••••${val.slice(-3)}`;
}

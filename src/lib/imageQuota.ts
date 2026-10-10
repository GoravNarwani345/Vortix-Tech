import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTA_FILE = path.join(DATA_DIR, "image_daily_quota.json");
export const DAILY_IMAGE_LIMIT = 5;

type QuotaRecord = {
  date: string; // YYYY-MM-DD
  count: number;
};

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

async function readQuota(): Promise<QuotaRecord> {
  const today = getTodayString();
  try {
    const raw = await fs.readFile(QUOTA_FILE, "utf-8");
    const data = JSON.parse(raw) as QuotaRecord;
    if (data.date === today) {
      return data;
    }
  } catch {
    // File missing or invalid JSON
  }
  return { date: today, count: 0 };
}

async function writeQuota(record: QuotaRecord): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(QUOTA_FILE, JSON.stringify(record, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist daily image quota:", err);
  }
}

/**
 * Check if the system has remaining daily image generation quota.
 */
export async function checkDailyImageQuota(): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
}> {
  const record = await readQuota();
  const remaining = Math.max(0, DAILY_IMAGE_LIMIT - record.count);
  return {
    allowed: record.count < DAILY_IMAGE_LIMIT,
    used: record.count,
    remaining,
    limit: DAILY_IMAGE_LIMIT,
  };
}

/**
 * Increment the count after a successful image generation.
 */
export async function incrementDailyImageUsage(): Promise<{
  used: number;
  remaining: number;
}> {
  const record = await readQuota();
  record.count += 1;
  await writeQuota(record);
  const remaining = Math.max(0, DAILY_IMAGE_LIMIT - record.count);
  return {
    used: record.count,
    remaining,
  };
}

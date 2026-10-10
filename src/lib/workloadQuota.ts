import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const QUOTA_FILE = path.join(DATA_DIR, "workload_daily_quota.json");

export const DAILY_LIMITS = {
  blog: 5,
  research: 1,
  image: 5,
} as const;

export type QuotaWorkloadType = keyof typeof DAILY_LIMITS;

type DailyQuotaRecord = {
  date: string; // YYYY-MM-DD
  blog: number;
  research: number;
  image: number;
};

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

async function readDailyQuotas(): Promise<DailyQuotaRecord> {
  const today = getTodayString();
  try {
    const raw = await fs.readFile(QUOTA_FILE, "utf-8");
    const data = JSON.parse(raw) as DailyQuotaRecord;
    if (data.date === today) {
      return {
        date: today,
        blog: typeof data.blog === "number" ? data.blog : 0,
        research: typeof data.research === "number" ? data.research : 0,
        image: typeof data.image === "number" ? data.image : 0,
      };
    }
  } catch {
    // File missing or from previous date
  }
  return { date: today, blog: 0, research: 0, image: 0 };
}

async function writeDailyQuotas(record: DailyQuotaRecord): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(QUOTA_FILE, JSON.stringify(record, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist workload daily quota:", err);
  }
}

/**
 * Check if a specific workload has remaining daily allowance.
 */
export async function checkDailyQuota(workload: QuotaWorkloadType): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
}> {
  const record = await readDailyQuotas();
  const used = record[workload];
  const limit = DAILY_LIMITS[workload];
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    used,
    remaining,
    limit,
  };
}

/**
 * Increment usage for a specific workload after a successful generation.
 */
export async function incrementDailyQuota(workload: QuotaWorkloadType): Promise<{
  used: number;
  remaining: number;
  limit: number;
}> {
  const record = await readDailyQuotas();
  record[workload] += 1;
  await writeDailyQuotas(record);

  const limit = DAILY_LIMITS[workload];
  const remaining = Math.max(0, limit - record[workload]);

  return {
    used: record[workload],
    remaining,
    limit,
  };
}

/**
 * Get snapshot of all current quotas for admin dashboard/UI display.
 */
export async function getAllDailyQuotas() {
  const record = await readDailyQuotas();
  return {
    date: record.date,
    chat: {
      unlimited: true,
      limit: "Unlimited",
      used: "N/A",
      remaining: "Unlimited",
    },
    blog: {
      used: record.blog,
      limit: DAILY_LIMITS.blog,
      remaining: Math.max(0, DAILY_LIMITS.blog - record.blog),
    },
    research: {
      used: record.research,
      limit: DAILY_LIMITS.research,
      remaining: Math.max(0, DAILY_LIMITS.research - record.research),
    },
    image: {
      used: record.image,
      limit: DAILY_LIMITS.image,
      remaining: Math.max(0, DAILY_LIMITS.image - record.image),
    },
  };
}

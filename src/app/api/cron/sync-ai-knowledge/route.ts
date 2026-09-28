import { NextResponse } from "next/server";
import { constantTimeEqual } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { syncAiKnowledge } from "@/lib/aiKnowledge";

async function handleCronSync(req: Request) {
  try {
    const cronSecret =
      (await getSetting("CRON_SECRET")) || process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured in settings or environment." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const providedKey =
      searchParams.get("key") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    if (!(await constantTimeEqual(providedKey, cronSecret))) {
      return NextResponse.json(
        { error: "Unauthorized cron access." },
        { status: 401 }
      );
    }

    // Execute daily AI knowledge compilation & caching
    const result = await syncAiKnowledge("cron");

    return NextResponse.json({
      success: true,
      message: "AI knowledge compiled and synchronized successfully.",
      syncedAt: result.lastSyncedAt,
      nextScheduledSyncAt: result.nextScheduledSyncAt,
      totalChars: result.totalChars,
      estimatedTokens: result.estimatedTokens,
      breakdown: result.breakdown.map((b) => ({
        source: b.name,
        count: b.count,
        chars: b.chars,
        tokens: b.tokens,
      })),
    });
  } catch (error) {
    console.error("Cron AI Sync Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleCronSync(req);
}

export async function POST(req: Request) {
  return handleCronSync(req);
}

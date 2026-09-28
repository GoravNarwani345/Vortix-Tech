import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { syncAiKnowledge } from "@/lib/aiKnowledge";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await syncAiKnowledge("manual");

    return NextResponse.json({
      success: true,
      message: "AI website knowledge re-compiled and synchronized successfully.",
      lastSyncedAt: updated.lastSyncedAt,
      nextScheduledSyncAt: updated.nextScheduledSyncAt,
      totalChars: updated.totalChars,
      estimatedTokens: updated.estimatedTokens,
      breakdown: updated.breakdown,
      history: updated.history,
    });
  } catch (error) {
    console.error("AI Sync POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAiKnowledgeAudit } from "@/lib/aiKnowledge";
import { getSetting } from "@/lib/settings";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const auditData = await getAiKnowledgeAudit();
    const apiKey = (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;
    const aiModel = (await getSetting("AI_MODEL")) || "gemini-2.5-flash";
    const temperature = (await getSetting("AI_TEMPERATURE")) ?? 0.7;
    const maxTokens = (await getSetting("AI_MAX_TOKENS")) ?? 800;

    return NextResponse.json({
      success: true,
      hasApiKey: Boolean(apiKey),
      model: aiModel,
      temperature,
      maxTokens,
      lastSyncedAt: auditData.lastSyncedAt,
      nextScheduledSyncAt: auditData.nextScheduledSyncAt,
      totalChars: auditData.totalChars,
      estimatedTokens: auditData.estimatedTokens,
      breakdown: auditData.breakdown,
      compiledPrompt: auditData.compiledPrompt,
      history: auditData.history,
    });
  } catch (error) {
    console.error("AI Audit GET error:", error);
    return NextResponse.json(
      { error: "Failed to load AI knowledge audit" },
      { status: 500 }
    );
  }
}

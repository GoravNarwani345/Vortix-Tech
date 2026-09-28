import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAiKnowledge } from "@/lib/aiKnowledge";
import { getSetting } from "@/lib/settings";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a test prompt or visitor question." },
        { status: 400 }
      );
    }

    const apiKey =
      (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please save your API key in the AI Configuration tab first.",
        },
        { status: 400 }
      );
    }

    const aiModel = (await getSetting("AI_MODEL")) || "gemini-2.5-flash";
    const temperature = (await getSetting("AI_TEMPERATURE")) ?? 0.7;
    const maxTokens = (await getSetting("AI_MAX_TOKENS")) ?? 800;

    // Fetch the active compiled website knowledge
    const systemPromptText = await getAiKnowledge();

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

    const startTime = Date.now();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPromptText }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt.trim() }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.error?.message || errorText;
      } catch {
        // Raw text
      }
      return NextResponse.json(
        {
          error: `Gemini API Error (${response.status}): ${parsedError}`,
          latencyMs,
        },
        { status: 400 }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    const usageMetadata = data.usageMetadata || {};

    return NextResponse.json({
      success: true,
      reply,
      latencyMs,
      modelUsed: aiModel,
      usage: {
        promptTokenCount:
          usageMetadata.promptTokenCount ??
          Math.ceil((systemPromptText.length + prompt.length) / 4),
        candidatesTokenCount:
          usageMetadata.candidatesTokenCount ?? Math.ceil(reply.length / 4),
        totalTokenCount: usageMetadata.totalTokenCount,
      },
    });
  } catch (error) {
    console.error("AI Audit Test error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Test request failed",
      },
      { status: 500 }
    );
  }
}

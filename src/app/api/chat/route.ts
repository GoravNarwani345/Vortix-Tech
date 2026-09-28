import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getSetting } from "@/lib/settings";
import { getAiKnowledge } from "@/lib/aiKnowledge";

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

type ChatHistoryEntry = {
  role?: string;
  parts?: { text?: unknown }[];
};

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(`chat:${ip}`, 20, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many messages. Please slow down." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { messageHistory } = await req.json();

    if (!Array.isArray(messageHistory) || messageHistory.length === 0) {
      return NextResponse.json(
        { error: "messageHistory must be a non-empty array." },
        { status: 400 }
      );
    }

    const contents = messageHistory
      .slice(-MAX_MESSAGES)
      .map((entry: ChatHistoryEntry) => {
        const role = entry?.role === "model" ? "model" : "user";
        const rawText = entry?.parts?.[0]?.text;
        const text =
          typeof rawText === "string"
            ? rawText.slice(0, MAX_CHARS_PER_MESSAGE)
            : "";
        return { role, parts: [{ text }] };
      });

    if (contents.every((c) => c.parts[0].text.length === 0)) {
      return NextResponse.json(
        { error: "No message content provided." },
        { status: 400 }
      );
    }

    const apiKey =
      (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const aiModel = (await getSetting("AI_MODEL")) || "gemini-2.5-flash";
    const temperature = (await getSetting("AI_TEMPERATURE")) ?? 0.7;
    const maxTokens = (await getSetting("AI_MAX_TOKENS")) ?? 800;

    // Use compiled and daily-synced overall website knowledge
    const knowledgeText = await getAiKnowledge();

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

    const systemInstruction = {
      parts: [{ text: knowledgeText }],
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: systemInstruction,
        contents,
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

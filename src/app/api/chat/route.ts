import { NextRequest, NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getSetting } from "@/lib/settings";
import { getAiKnowledge } from "@/lib/aiKnowledge";
import { executeAiChat } from "@/lib/aiClient";

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

    const chatMessages = messageHistory
      .slice(-MAX_MESSAGES)
      .map((entry: ChatHistoryEntry) => {
        const role = (entry?.role === "model" ? "model" : "user") as "model" | "user";
        const rawText = entry?.parts?.[0]?.text;
        const text =
          typeof rawText === "string"
            ? rawText.slice(0, MAX_CHARS_PER_MESSAGE)
            : "";
        return { role, content: text };
      })
      .filter((m) => m.content.length > 0);

    if (chatMessages.length === 0) {
      return NextResponse.json(
        { error: "No message content provided." },
        { status: 400 }
      );
    }

    const temperature = (await getSetting("AI_TEMPERATURE")) ?? 0.7;
    const maxTokens = (await getSetting("AI_MAX_TOKENS")) ?? 800;

    // Use compiled and daily-synced overall website knowledge
    const knowledgeText = await getAiKnowledge();

    const completion = await executeAiChat({
      messages: chatMessages,
      systemPrompt: knowledgeText,
      temperature,
      maxTokens,
      task: "chat",
    });

    return NextResponse.json({
      reply: completion.text || "I'm sorry, I couldn't generate a response.",
      modelUsed: completion.modelUsed,
      provider: completion.provider,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "AI Error" },
      { status: 500 }
    );
  }
}

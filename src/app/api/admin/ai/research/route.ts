import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";
import { checkDailyQuota, incrementDailyQuota } from "@/lib/workloadQuota";

export type ResearchResult = {
  suggestedTitles: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];
  category: string;
  executiveSummary: string;
  keyInsights: string[];
  references: { title: string; url: string; description: string }[];
  suggestedOutline: { heading: string; points: string[] }[];
  imagePrompts: {
    minimalist: string;
    isometric3D: string;
    cyberDark: string;
  };
};

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quota = await checkDailyQuota("research");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Daily topic research quota reached (${quota.used}/${quota.limit} brief generated today). Resets at midnight UTC.`,
          quota,
        },
        { status: 429 }
      );
    }

    const { topic, prompt: userCustomPrompt, focusArea } = await req.json();

    if (!topic && !userCustomPrompt) {
      return NextResponse.json(
        { error: "Please provide a topic or prompt to research." },
        { status: 400 }
      );
    }

    const query = topic || userCustomPrompt;
    const systemPrompt = `You are a Senior Technical Researcher and Content Strategist for Vortix Tech (an elite modern web, mobile, and AI automation engineering agency).
Conduct a comprehensive, deep technical research brief on the following topic or prompt:

QUERY: """${query}"""
ADDITIONAL FOCUS: """${focusArea || "Industry best practices, SEO traffic opportunities, real-world architecture"}"""

TASK:
1. Suggest 3-5 irresistible, highly clickable and SEO-friendly article titles targeting high commercial/informational intent.
2. Identify 4-6 primary SEO keywords and 4-6 secondary long-tail keywords with high search value.
3. Classify into a fitting category (e.g., "AI & Automation", "Web Development", "Cloud Architecture", "Next.js", "Case Studies").
4. Write a concise, punchy executive summary of the topic.
5. Provide 3-5 authoritative, accurate technical insights/facts with depth.
6. Provide 2-4 real, reputable reference sources (official docs like nextjs.org/docs, cloud.google.com, github.com, etc. with brief descriptions).
7. Draft a logical, comprehensive H2/H3 article outline.
8. Craft 3 custom AI image generation prompts optimized for free image tools (Pollinations, Ideogram, Leonardo AI):
   - minimalist: Clean vector/editorial 2D tech art
   - isometric3D: 3D render with soft ambient occlusion
   - cyberDark: Sleek dark-mode aesthetic with neon/cyan accents

Return ONLY a valid JSON object matching this TypeScript structure (no backticks, no markdown):
{
  "suggestedTitles": ["title 1", "title 2", "title 3"],
  "primaryKeywords": ["kw 1", "kw 2"],
  "secondaryKeywords": ["kw 1", "kw 2"],
  "category": "string",
  "executiveSummary": "string",
  "keyInsights": ["insight 1", "insight 2"],
  "references": [
    { "title": "Reference Name", "url": "https://...", "description": "why it is relevant" }
  ],
  "suggestedOutline": [
    { "heading": "H2 Heading", "points": ["subpoint 1", "subpoint 2"] }
  ],
  "imagePrompts": {
    "minimalist": "string",
    "isometric3D": "string",
    "cyberDark": "string"
  }
}`;

    const completion = await executeAiCompletion({
      prompt: systemPrompt,
      temperature: 0.5,
      maxTokens: 2500,
      task: "research",
    });

    const rawReply = completion.text;

    if (!rawReply) {
      throw new Error("No response received from research engine.");
    }

    const cleaned = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
    const result: ResearchResult = JSON.parse(cleaned);

    const updatedQuota = await incrementDailyQuota("research");

    return NextResponse.json({
      success: true,
      quota: updatedQuota,
      research: result,
      provider: completion.provider,
      modelUsed: completion.modelUsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to conduct research",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

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
    const { topic, prompt: userCustomPrompt, focusArea } = await req.json();

    if (!topic && !userCustomPrompt) {
      return NextResponse.json(
        { error: "Please provide a topic or prompt to research." },
        { status: 400 }
      );
    }

    const apiKey = (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add it in Admin Settings." },
        { status: 400 }
      );
    }

    const aiModel = (await getSetting("AI_MODEL")) || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

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

Return ONLY a valid JSON object matching this TypeScript structure:
{
  "suggestedTitles": ["title 1", "title 2", "title 3"],
  "primaryKeywords": ["kw 1", "kw 2", ...],
  "secondaryKeywords": ["kw 1", "kw 2", ...],
  "category": "string",
  "executiveSummary": "string",
  "keyInsights": ["insight 1", "insight 2", ...],
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawReply) {
      throw new Error("No response received from research engine.");
    }

    const cleaned = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
    const result: ResearchResult = JSON.parse(cleaned);

    return NextResponse.json({ success: true, research: result });
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

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";

export type ProjectAuditResult = {
  score: number; // 0-100
  rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  summary: string;
  suggestedKeywords: string[];
  suggestedTitle?: string;
  recommendedMetaDescription: string;
  strengths: string[];
  recommendations: string[];
};

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, category, description, tags, liveUrl, githubUrl } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required for an SEO audit." },
        { status: 400 }
      );
    }

    const prompt = `You are a world-class Technical SEO and Conversion Rate Optimization (CRO) expert for high-end web & AI agencies.
Perform an in-depth SEO audit and generate targeted, high-intent keywords for this portfolio project:

PROJECT DETAILS:
- Title: "${title}"
- Category: "${category || "Web App"}"
- Description: """${description}"""
- Current Tags: "${tags || ""}"
- Live URL: "${liveUrl || "None provided"}"
- GitHub URL: "${githubUrl || "None provided"}"

OBJECTIVES:
1. Generate 8-12 high-intent, SEO-friendly long-tail keywords that potential clients would search when looking to hire an agency or buy a similar solution (e.g., "custom healthcare crm development", "enterprise next.js dashboard agency", "n8n workflow automation services"). Avoid single generic words.
2. Calculate an SEO Score (0-100) based on title clarity, search intent, description depth, technical keywords, and conversion elements.
3. Formulate a compelling meta description (140-160 characters) with a clear value proposition.
4. Provide a refined, SEO-optimized title suggestion if the current one can be improved.
5. Identify 2-4 key strengths and 2-4 actionable recommendations to rank higher on Google and convert visitors into clients.

Return ONLY a valid JSON object matching this TypeScript interface (no markdown, no backticks):
{
  "score": number,
  "rating": "Excellent" | "Good" | "Needs Improvement" | "Poor",
  "summary": "Brief 1-2 sentence executive assessment",
  "suggestedKeywords": ["keyword 1", "keyword 2", ...],
  "suggestedTitle": "Optimized project title or null if original is great",
  "recommendedMetaDescription": "140-160 char snippet",
  "strengths": ["Strength 1", "Strength 2"],
  "recommendations": ["Actionable tip 1", "Actionable tip 2"]
}`;

    const aiResult = await executeAiCompletion({
      prompt,
      temperature: 0.4,
      maxTokens: 1500,
      task: "audit",
    });

    const rawReply = aiResult.text;

    if (!rawReply) {
      throw new Error("No response received from AI model.");
    }

    let parsedResult: ProjectAuditResult;
    try {
      const cleaned = rawReply.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      // Heuristic fallback if JSON parsing failed
      parsedResult = {
        score: Math.min(85, Math.max(50, Math.round(description.length / 10))),
        rating: "Good",
        summary: "Project details evaluated. Strong baseline with opportunities for deeper technical keywords.",
        suggestedKeywords: [
          `${title.toLowerCase()} development`,
          `${category.toLowerCase()} agency`,
          "enterprise web application",
          "modern UI/UX design",
          "custom software engineering",
        ],
        recommendedMetaDescription: description.slice(0, 155),
        strengths: ["Clear project concept", "Defined category"],
        recommendations: [
          "Include quantifiable client results (e.g. % speed increase or hours saved)",
          "Add target industry-specific keywords into the description",
        ],
      };
    }

    return NextResponse.json({ success: true, audit: parsedResult });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to audit project with AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

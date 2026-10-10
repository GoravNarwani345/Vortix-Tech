import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      category,
      excerpt,
      content,
      style = "clean",
    } = await req.json();

    if (!title && !content) {
      return NextResponse.json(
        { error: "Title or article content is required." },
        { status: 400 }
      );
    }

    // Style guidance
    let styleGuidance = "Style: Minimalist 2D editorial tech illustration, clean lines, subtle gradients, studio aesthetic, high resolution.";
    if (style === "isometric") {
      styleGuidance = "Style: 3D isometric tech architectural render, soft ambient lighting, octane render, smooth pastel tech palette, 8k.";
    } else if (style === "dark") {
      styleGuidance = "Style: Sleek dark cyberpunk aesthetic, deep navy background with glowing cyan and violet neon accents, futuristic 8k.";
    } else if (style === "blueprint") {
      styleGuidance = "Style: Technical architectural blueprint schematic, clean vector wireframes, engineering data flow, dark sapphire blue.";
    }

    const snippet = (content || "").slice(0, 1500);

    const prompt = `You are a Senior Art Director and Visual Prompt Engineer for Vortix Tech (a modern software engineering agency).
Create a single, highly evocative, descriptive visual prompt for an AI image generator (Pollinations, Flux, Ideogram, Midjourney) to generate the cover image for this article:

ARTICLE TITLE: "${title || "Software Engineering"}"
CATEGORY: "${category || "Technology"}"
EXCERPT: "${excerpt || ""}"
CONTENT OVERVIEW: """${snippet}"""

${styleGuidance}

REQUIREMENTS:
1. Describe a conceptual, metaphoric, or architectural visual scene that captures the essence of this article.
2. Avoid generic imagery like "a programmer sitting at a desk with a laptop" or literal floating green binary code.
3. Focus on dynamic geometric forms, system pipelines, interconnected holographic nodes, glowing data highways, or modern hardware/software harmony.
4. Return ONLY the final prompt string (25-45 words). Do not include quotes, labels, or introductory pleasantries.`;

    let generatedPrompt = "";
    try {
      const aiResult = await executeAiCompletion({
        prompt,
        temperature: 0.7,
        maxTokens: 200,
      });
      generatedPrompt = (aiResult.text || "").replace(/^["']|["']$/g, "").trim();
    } catch {
      // Fallback heuristic prompt if model is unreachable
      let suffix = "minimalist editorial technology digital art 4k";
      if (style === "isometric") suffix = "3D isometric tech workspace render soft lighting 8k";
      if (style === "dark") suffix = "cyberpunk dark aesthetic glowing neon cyan accents 4k";
      if (style === "blueprint") suffix = "technical architectural blueprint schematic vector dark blue 8k";
      generatedPrompt = `${title || "Modern software architecture"}, ${category || "engineering"}, ${suffix}`;
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate image prompt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

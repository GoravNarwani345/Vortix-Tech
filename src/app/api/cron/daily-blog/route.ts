import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { constantTimeEqual } from "@/lib/session";
import { getSetting } from "@/lib/settings";
import { executeAiCompletion, generateAiImage } from "@/lib/aiClient";

// This should be triggered by a Cron service (like Vercel Cron or GitHub Actions)
export async function GET(req: Request) {
  try {
    // 1. Required Security Check
    const cronSecret = (await getSetting("CRON_SECRET")) || process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured" },
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
        { error: "Unauthorized cron access" },
        { status: 401 }
      );
    }

    // 2. Fetch a Trending Topic using DeepSeek priority
    const topicPrompt = `You are an AI trend analyzer. Suggest EXACTLY ONE highly engaging, trending, and fun topic for a technology agency blog (Vortix Tech) based on today's tech news. Focus on AI, web development, or automation. Return ONLY the topic string, no quotes.`;
    
    const topicResult = await executeAiCompletion({
      prompt: topicPrompt,
      temperature: 0.9,
      maxTokens: 100,
      task: "blog",
    });
    
    const topic = topicResult.text.trim() || "The Future of AI Automation";

    // 3. Write the Article using DeepSeek priority
    const writePrompt = `Write a highly engaging, SEO-optimized blog article about "${topic}".
    Requirements:
    1. Formatted in Markdown.
    2. Include a catchy title as an H1 (# Title).
    3. Short 1-2 sentence excerpt wrapped in <excerpt></excerpt>.
    4. Suggested category wrapped in <category></category>.
    5. Professional, exciting tone.
    Return ONLY markdown.`;

    const writeResult = await executeAiCompletion({
      prompt: writePrompt,
      temperature: 0.7,
      maxTokens: 2500,
      task: "blog",
    });

    const markdown = writeResult.text;

    if (!markdown) throw new Error("No markdown generated");

    const excerptMatch = markdown.match(/<excerpt>([\s\S]*?)<\/excerpt>/);
    const categoryMatch = markdown.match(/<category>([\s\S]*?)<\/category>/);
    const titleMatch = markdown.match(/^#\s+(.*)/m);

    const excerpt = excerptMatch ? excerptMatch[1].trim() : "An automated AI article.";
    const category = categoryMatch ? categoryMatch[1].trim() : "Technology";
    const title = titleMatch ? titleMatch[1].trim() : topic;
    
    const cleanMarkdown = markdown
      .replace(/<excerpt>[\s\S]*?<\/excerpt>/g, "")
      .replace(/<category>[\s\S]*?<\/category>/g, "")
      .trim();

    // 4. Generate Cover Image (StepFun AI with Pollinations fallback)
    let imageUrl: string;
    try {
      const imgRes = await generateAiImage({
        prompt: `${title}, modern clean tech digital illustration, 4k digital art`,
        size: "1024x1024",
      });
      imageUrl = imgRes.url;
    } catch (imgErr) {
      console.warn("AI image generation fallback in daily blog cron:", imgErr);
      const imagePrompt = encodeURIComponent(`${title} modern technology abstract high quality 4k digital art`);
      imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1200&height=630&nologo=true`;
    }

    // 5. Generate Slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    // 6. Save to Database
    const article = await prisma.article.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness
        category,
        excerpt,
        content: cleanMarkdown,
        image: imageUrl,
        readTime: `${Math.max(3, Math.ceil(cleanMarkdown.split(" ").length / 200))} min read`,
        isPublished: true,
      },
    });

    return NextResponse.json({ success: true, article }, { status: 200 });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      {
        error: "Cron job failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

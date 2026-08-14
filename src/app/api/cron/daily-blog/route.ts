import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This should be triggered by a Cron service (like Vercel Cron or GitHub Actions)
export async function GET(req: Request) {
  try {
    // 1. Basic Security Check (Optional, but recommended)
    const { searchParams } = new URL(req.url);
    const cronKey = searchParams.get("key");
    // Ensure you set CRON_SECRET in your .env if you want to secure this
    if (process.env.CRON_SECRET && cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is missing");

    // 2. Fetch a Trending Topic
    const topicEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const topicPrompt = `You are an AI trend analyzer. Suggest EXACTLY ONE highly engaging, trending, and fun topic for a technology agency blog (Vortix Tech) based on today's tech news. Focus on AI, web development, or automation. Return ONLY the topic string, no quotes.`;
    
    const topicResponse = await fetch(topicEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: topicPrompt }] }],
        generationConfig: { temperature: 0.9 },
      }),
    });
    
    if (!topicResponse.ok) throw new Error("Failed to get topic");
    const topicData = await topicResponse.json();
    const topic = topicData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "The Future of AI Automation";

    // 3. Write the Article
    const writePrompt = `Write a highly engaging, SEO-optimized blog article about "${topic}".
    Requirements:
    1. Formatted in Markdown.
    2. Include a catchy title as an H1 (# Title).
    3. Short 1-2 sentence excerpt wrapped in <excerpt></excerpt>.
    4. Suggested category wrapped in <category></category>.
    5. Professional, exciting tone.
    Return ONLY markdown.`;

    const writeResponse = await fetch(topicEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: writePrompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!writeResponse.ok) throw new Error("Failed to write article");
    const writeData = await writeResponse.json();
    const markdown = writeData.candidates?.[0]?.content?.parts?.[0]?.text;

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

    // 4. Generate Cover Image (Keyless via Pollinations)
    const imagePrompt = encodeURIComponent(`${title} modern technology abstract high quality 4k digital art`);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1200&height=630&nologo=true`;

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

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Cron job failed", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth")?.value;
  return authCookie === "true";
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is not configured.");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are an expert technical writer for Vortix Tech. Write a highly engaging, SEO-optimized, and informative blog article about "${topic}".
    
    Requirements:
    1. The article MUST be formatted in Markdown.
    2. Include a catchy title as an H1 (# Title).
    3. Include a short 1-2 sentence excerpt at the very beginning wrapped in <excerpt></excerpt> tags.
    4. Include a suggested category (e.g. "AI Generation", "Web Development") wrapped in <category></category> tags.
    5. The content should have proper headings (H2, H3), bullet points, and be well structured.
    6. Ensure the tone is professional, forward-thinking, and exciting.
    
    Return ONLY the markdown content. Do not wrap it in \`\`\`markdown.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) throw new Error("Failed to generate article from Gemini API");

    const data = await response.json();
    const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!markdown) throw new Error("No content generated");

    // Extract metadata
    const excerptMatch = markdown.match(/<excerpt>([\s\S]*?)<\/excerpt>/);
    const categoryMatch = markdown.match(/<category>([\s\S]*?)<\/category>/);
    const titleMatch = markdown.match(/^#\s+(.*)/m);

    const excerpt = excerptMatch ? excerptMatch[1].trim() : "An insightful article by Vortix Tech.";
    const category = categoryMatch ? categoryMatch[1].trim() : "Technology";
    const title = titleMatch ? titleMatch[1].trim() : topic;
    
    // Clean up tags from markdown
    const cleanMarkdown = markdown
      .replace(/<excerpt>[\s\S]*?<\/excerpt>/g, "")
      .replace(/<category>[\s\S]*?<\/category>/g, "")
      .trim();

    return NextResponse.json({ 
      success: true, 
      article: {
        title,
        excerpt,
        category,
        content: cleanMarkdown,
        readTime: `${Math.max(3, Math.ceil(cleanMarkdown.split(" ").length / 200))} min read`
      } 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate article", details: error.message },
      { status: 500 }
    );
  }
}

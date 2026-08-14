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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is not configured.");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are a tech blog content strategist. Suggest 5 highly engaging, trending, and fun topics for a technology agency blog (Vortix Tech). 
    Topics should be related to: Web Development, AI Agents, ComfyUI, LLMs, Next.js, React Native, or Automation.
    Return ONLY a valid JSON array of strings, like: ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]. Do not include markdown code blocks or any other text.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 },
      }),
    });

    if (!response.ok) throw new Error("Failed to generate topics from Gemini API");

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    let topics = [];
    try {
      topics = JSON.parse(reply.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (e) {
      // Fallback
      topics = [
        "The Future of AI Agents in 2026",
        "Mastering Next.js 15 App Router",
        "Automating Your Business with n8n",
        "Building React Native Apps with AI",
        "Advanced ComfyUI Workflows for Agencies"
      ];
    }

    return NextResponse.json({ success: true, topics }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate topics", details: error.message },
      { status: 500 }
    );
  }
}

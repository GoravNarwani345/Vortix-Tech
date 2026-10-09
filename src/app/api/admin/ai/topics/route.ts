import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";

export type SEOTopicItem = {
  title: string;
  category: string;
  targetKeyword: string;
  searchIntent: "Commercial" | "Informational" | "Transactional";
  seoPotential: "High" | "Breakthrough" | "Trending";
  briefReason: string;
};

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const categoryFilter = body?.category;

    const prompt = `You are an elite SEO strategist and Content Director for Vortix Tech (an agency building Next.js, mobile apps, n8n automations, LLMs, and RAG systems).
Generate 6 daily high-traffic, SEO-opportunity article ideas that have strong search intent (people looking for solutions or agency services).
${categoryFilter ? `Focus specifically on the category: "${categoryFilter}".` : ""}

For each topic, provide:
1. title: Compelling, click-worthy, SEO-optimized title
2. category: "Web Development", "AI & Automation", "Workflow Architecture", "Mobile Engineering", or "Product Strategy"
3. targetKeyword: Specific long-tail keyword with high search intent
4. searchIntent: "Commercial" (decision phase), "Informational" (problem solving), or "Transactional" (ready to hire)
5. seoPotential: "High", "Breakthrough", or "Trending"
6. briefReason: 1 sentence on why this article will attract clients or high search volume

Return ONLY a valid JSON array of objects matching this TypeScript type:
Array<{
  title: string;
  category: string;
  targetKeyword: string;
  searchIntent: "Commercial" | "Informational" | "Transactional";
  seoPotential: "High" | "Breakthrough" | "Trending";
  briefReason: string;
}>`;

    const aiResult = await executeAiCompletion({
      prompt,
      temperature: 0.8,
      maxTokens: 1500,
    });

    const reply = aiResult.text;

    let items: SEOTopicItem[] = [];
    try {
      const cleaned = (reply || "").replace(/```json/g, "").replace(/```/g, "").trim();
      items = JSON.parse(cleaned);
    } catch {
      // Fallback curated list
      items = [
        {
          title: "How to Build a Custom RAG Knowledge Base for E-Commerce Stores in 2026",
          category: "AI & Automation",
          targetKeyword: "custom rag chatbot for ecommerce",
          searchIntent: "Commercial",
          seoPotential: "Breakthrough",
          briefReason: "Directly attracts Shopify and WooCommerce store owners looking for automated customer service.",
        },
        {
          title: "n8n vs Zapier: Why Enterprise Companies Are Switching for Workflow Automation",
          category: "Workflow Architecture",
          targetKeyword: "n8n vs zapier enterprise automation",
          searchIntent: "Commercial",
          seoPotential: "High",
          briefReason: "Captures buyers in the evaluation stage who need custom automation setups.",
        },
        {
          title: "Next.js 16 App Router Performance: Optimizing Core Web Vitals for SaaS",
          category: "Web Development",
          targetKeyword: "nextjs app router core web vitals optimization",
          searchIntent: "Informational",
          seoPotential: "High",
          briefReason: "Demonstrates deep technical authority to CTOs and tech founders looking for developers.",
        },
        {
          title: "Multi-Agent AI Systems on WhatsApp: Automating Field Operations Without New Apps",
          category: "AI & Automation",
          targetKeyword: "whatsapp multi agent ai business automation",
          searchIntent: "Transactional",
          seoPotential: "Trending",
          briefReason: "High curiosity topic with direct commercial conversion for logistics and service firms.",
        },
        {
          title: "The True Cost of Building an MVP Web Application in 2026",
          category: "Product Strategy",
          targetKeyword: "cost to build mvp web app",
          searchIntent: "Commercial",
          seoPotential: "High",
          briefReason: "Captures startup founders with budget ready to hire an agency.",
        },
      ];
    }

    // String array for backward compatibility
    const topics = items.map((i) => i.title);

    return NextResponse.json({ success: true, topics, items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate topics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

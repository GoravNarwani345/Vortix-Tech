import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { executeAiCompletion } from "@/lib/aiClient";
import fs from "fs/promises";
import path from "path";

export const maxDuration = 60;

export type SEOTopicItem = {
  title: string;
  category: string;
  targetKeyword: string;
  searchIntent: "Commercial" | "Informational" | "Transactional";
  seoPotential: "High" | "Breakthrough" | "Trending";
  briefReason: string;
};

interface CachedDailyTopics {
  generatedAt: number;
  items: SEOTopicItem[];
  category?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(DATA_DIR, "daily_topics.json");
const CACHE_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours

const FALLBACK_TOPICS: SEOTopicItem[] = [
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
  {
    title: "Self-Hosting ComfyUI & LLMs on Cloud GPU Infrastructure for High-Volume Production",
    category: "AI & Automation",
    targetKeyword: "self host comfyui cloud gpu enterprise",
    searchIntent: "Commercial",
    seoPotential: "Breakthrough",
    briefReason: "Attracts scale-ups seeking to optimize high AI token bills with dedicated infrastructure.",
  },
];

async function readCachedTopics(): Promise<CachedDailyTopics | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const data = JSON.parse(raw) as CachedDailyTopics;
    if (data && typeof data.generatedAt === "number" && Array.isArray(data.items)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeCachedTopics(items: SEOTopicItem[], category?: string): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const payload: CachedDailyTopics = {
      generatedAt: Date.now(),
      items,
      category,
    };
    await fs.writeFile(CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write daily topics cache:", err);
  }
}

async function generateFreshTopics(categoryFilter?: string): Promise<SEOTopicItem[]> {
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
    task: "blog",
  });

  const reply = aiResult.text;
  let items: SEOTopicItem[] = [];
  try {
    const cleaned = (reply || "").replace(/```json/gi, "").replace(/```/g, "").trim();
    items = JSON.parse(cleaned);
  } catch {
    items = FALLBACK_TOPICS;
  }

  if (!Array.isArray(items) || items.length === 0) {
    items = FALLBACK_TOPICS;
  }

  return items;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cached = await readCachedTopics();
    const now = Date.now();

    if (cached && now - cached.generatedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        items: cached.items,
        topics: cached.items.map((i) => i.title),
        cached: true,
        generatedAt: cached.generatedAt,
        validUntil: cached.generatedAt + CACHE_TTL_MS,
      });
    }

    // Cache expired or missing: generate fresh daily topics
    const freshItems = await generateFreshTopics();
    await writeCachedTopics(freshItems);

    return NextResponse.json({
      success: true,
      items: freshItems,
      topics: freshItems.map((i) => i.title),
      cached: false,
      generatedAt: now,
      validUntil: now + CACHE_TTL_MS,
    });
  } catch (error) {
    console.error("GET daily topics error:", error);
    // On failure, serve fallback if available
    const cached = await readCachedTopics();
    if (cached?.items?.length) {
      return NextResponse.json({
        success: true,
        items: cached.items,
        topics: cached.items.map((i) => i.title),
        cached: true,
        generatedAt: cached.generatedAt,
        validUntil: cached.generatedAt + CACHE_TTL_MS,
      });
    }

    return NextResponse.json({
      success: true,
      items: FALLBACK_TOPICS,
      topics: FALLBACK_TOPICS.map((i) => i.title),
      cached: true,
      generatedAt: Date.now(),
      validUntil: Date.now() + CACHE_TTL_MS,
    });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const categoryFilter = body?.category;
    const forceRefresh = Boolean(body?.forceRefresh);

    const now = Date.now();
    const cached = await readCachedTopics();

    // If not forcing refresh and active cache exists within 23 hours, return cached
    if (!forceRefresh && !categoryFilter && cached && now - cached.generatedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        items: cached.items,
        topics: cached.items.map((i) => i.title),
        cached: true,
        generatedAt: cached.generatedAt,
        validUntil: cached.generatedAt + CACHE_TTL_MS,
      });
    }

    const items = await generateFreshTopics(categoryFilter);
    await writeCachedTopics(items, categoryFilter);

    return NextResponse.json({
      success: true,
      items,
      topics: items.map((i) => i.title),
      cached: false,
      generatedAt: now,
      validUntil: now + CACHE_TTL_MS,
    });
  } catch (error) {
    console.error("POST daily topics error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate topics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { syncAiKnowledge } from "@/lib/aiKnowledge";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: articles }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, category, excerpt, content, image, readTime, isPublished, author } =
      body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        category: category || "Technology",
        excerpt: excerpt || "",
        content,
        image: image || "",
        readTime: readTime || "3 min read",
        isPublished: isPublished ?? true,
        ...(author ? { author } : {}),
      },
    });

    // Auto-update AI knowledge base immediately with the new article
    void syncAiKnowledge("manual");

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

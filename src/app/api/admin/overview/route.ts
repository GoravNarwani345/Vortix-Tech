import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getAiKnowledgeAudit } from "@/lib/aiKnowledge";
import { getSetting } from "@/lib/settings";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch counts and recent records in parallel with fallbacks
    let totalFeedbacks = 0;
    let newFeedbacksCount = 0;
    let recentFeedbacks: Array<{
      id: string;
      name: string;
      email: string;
      subject: string;
      status: string;
      createdAt: Date;
    }> = [];

    let totalProjects = 0;
    let recentProjects: Array<{
      id: string;
      title: string;
      category: string;
      isPublished: boolean;
      createdAt: Date;
    }> = [];

    let totalArticles = 0;
    let recentArticles: Array<{
      id: string;
      title: string;
      category: string;
      slug: string;
      createdAt: Date;
      isPublished: boolean;
    }> = [];

    let totalTestimonials = 0;
    let totalServices = 0;
    let totalCategories = 0;

    try {
      [
        totalFeedbacks,
        newFeedbacksCount,
        recentFeedbacks,
        totalProjects,
        recentProjects,
        totalArticles,
        recentArticles,
        totalTestimonials,
        totalServices,
        totalCategories,
      ] = await Promise.all([
        prisma.feedback.count(),
        prisma.feedback.count({ where: { status: "New" } }),
        prisma.feedback.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            subject: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.project.count(),
        prisma.project.findMany({
          take: 4,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            isPublished: true,
            createdAt: true,
          },
        }),
        prisma.article.count(),
        prisma.article.findMany({
          take: 4,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            category: true,
            slug: true,
            createdAt: true,
            isPublished: true,
          },
        }),
        prisma.testimonial.count(),
        prisma.service.count(),
        prisma.category.count(),
      ]);
    } catch (dbErr) {
      console.warn("DB query warning in overview:", dbErr);
    }

    // AI Knowledge Stats
    let aiStats = {
      lastSyncedAt: null as string | null,
      totalChars: 0,
      estimatedTokens: 0,
      model: "gemini-3.8-flash",
      hasApiKey: false,
    };

    try {
      const audit = await getAiKnowledgeAudit();
      const apiKey = (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;
      const model = (await getSetting("AI_MODEL")) || "gemini-3.8-flash";
      aiStats = {
        lastSyncedAt: audit.lastSyncedAt || null,
        totalChars: audit.totalChars || 0,
        estimatedTokens: audit.estimatedTokens || 0,
        model,
        hasApiKey: Boolean(apiKey),
      };
    } catch {
      // Ignore AI audit error
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalFeedbacks,
        newFeedbacksCount,
        totalProjects,
        totalArticles,
        totalTestimonials,
        totalServices,
        totalCategories,
        aiKnowledge: aiStats,
      },
      recentFeedbacks,
      recentProjects,
      recentArticles,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard overview data" },
      { status: 500 }
    );
  }
}

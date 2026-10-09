import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { syncAiKnowledge } from "@/lib/aiKnowledge";
import { validateProjectMedia } from "@/lib/mediaHelper";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
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
    const { title, category, images, description, tags, liveUrl, githubUrl, isPublished } =
      body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const mediaList = Array.isArray(images) ? images : [];
    const mediaCheck = validateProjectMedia(mediaList);
    if (!mediaCheck.valid) {
      return NextResponse.json({ error: mediaCheck.error }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        category: category || "Web App",
        images: Array.isArray(images) ? images : [],
        description,
        tags: tags || "",
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        isPublished: isPublished ?? true,
      },
    });

    // Auto-update AI knowledge base immediately with the new project
    void syncAiKnowledge("manual");

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

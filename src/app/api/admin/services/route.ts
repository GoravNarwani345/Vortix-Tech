import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { syncAiKnowledge } from "@/lib/aiKnowledge";
import { slugify } from "@/lib/utils";
import { ensureSeedData } from "@/lib/seedData";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureSeedData();
    const services = await prisma.service.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch services",
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
    const {
      title,
      slug: customSlug,
      category,
      description,
      features,
      icon,
      iconBg,
      iconColor,
      order,
      isPublished,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, category, and description are required" },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();
    const slug = slugify(customSlug || trimmedTitle);

    // Check slug uniqueness
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A service with slug '${slug}' already exists` },
        { status: 409 }
      );
    }

    const service = await prisma.service.create({
      data: {
        title: trimmedTitle,
        slug,
        category: category.trim(),
        description: description.trim(),
        features: Array.isArray(features)
          ? features.map((f: string) => f.trim()).filter(Boolean)
          : [],
        icon: icon || "Globe",
        iconBg: iconBg || "bg-blue-50",
        iconColor: iconColor || "text-blue-500",
        order: typeof order === "number" ? order : 0,
        isPublished: isPublished ?? true,
      },
    });

    // Auto-sync AI Knowledge base
    void syncAiKnowledge("manual");

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

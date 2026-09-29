import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    // Also count usage across Services and Projects
    const [services, projects] = await Promise.all([
      prisma.service.findMany({ select: { category: true } }),
      prisma.project.findMany({ select: { category: true } }),
    ]);

    const serviceCounts = services.reduce<Record<string, number>>((acc, s) => {
      acc[s.category.toLowerCase()] = (acc[s.category.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    const projectCounts = projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.category.toLowerCase()] = (acc[p.category.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    const enriched = categories.map((cat) => ({
      ...cat,
      servicesCount: serviceCounts[cat.name.toLowerCase()] || serviceCounts[cat.slug.toLowerCase()] || 0,
      projectsCount: projectCounts[cat.name.toLowerCase()] || projectCounts[cat.slug.toLowerCase()] || 0,
    }));

    return NextResponse.json({ success: true, data: enriched }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
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
    const { name, slug: customSlug, description, scope, order } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = slugify(customSlug || trimmedName);

    // Check if slug already exists
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: `A category with slug '${slug}' already exists` },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        scope: scope || "ALL",
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

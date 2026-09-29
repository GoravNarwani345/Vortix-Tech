import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { syncAiKnowledge } from "@/lib/aiKnowledge";
import { slugify } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: service }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    let updatedSlug = existing.slug;
    if (customSlug || (title && title !== existing.title)) {
      updatedSlug = slugify(customSlug || title);
      const conflict = await prisma.service.findFirst({
        where: { slug: updatedSlug, NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `Slug '${updatedSlug}' is already taken by another service` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        slug: updatedSlug,
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(Array.isArray(features)
          ? { features: features.map((f: string) => f.trim()).filter(Boolean) }
          : {}),
        ...(icon !== undefined ? { icon } : {}),
        ...(iconBg !== undefined ? { iconBg } : {}),
        ...(iconColor !== undefined ? { iconColor } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });

    // Auto-sync AI Knowledge base
    void syncAiKnowledge("manual");

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.service.delete({ where: { id } });

    // Auto-sync AI Knowledge base
    void syncAiKnowledge("manual");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

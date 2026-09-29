import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
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
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch category",
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
    const { name, slug: customSlug, description, scope, order } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    let updatedSlug = existing.slug;
    if (customSlug || (name && name !== existing.name)) {
      updatedSlug = slugify(customSlug || name);
      // Check if new slug conflicts with another category
      const slugConflict = await prisma.category.findFirst({
        where: { slug: updatedSlug, NOT: { id } },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: `Slug '${updatedSlug}' is already taken by another category` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        slug: updatedSlug,
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(scope !== undefined ? { scope } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update category",
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
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check usage in Services or Projects
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const [servicesCount, projectsCount] = await Promise.all([
      prisma.service.count({
        where: {
          OR: [{ category: category.name }, { category: category.slug }],
        },
      }),
      prisma.project.count({
        where: {
          OR: [{ category: category.name }, { category: category.slug }],
        },
      }),
    ]);

    if (!force && (servicesCount > 0 || projectsCount > 0)) {
      return NextResponse.json(
        {
          error: `Category is currently used by ${servicesCount} service(s) and ${projectsCount} project(s). Reassign them first or confirm force delete.`,
          requiresConfirmation: true,
          servicesCount,
          projectsCount,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/seedData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // e.g. "SERVICES", "PORTFOLIO", "BLOG", "ALL"

    const where: any = {};
    if (scope && scope !== "ALL") {
      where.OR = [{ scope }, { scope: "ALL" }];
    }

    let categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    // Fallback to defaults if empty
    if (categories.length === 0) {
      categories = DEFAULT_CATEGORIES.filter((c) => {
        if (!scope || scope === "ALL") return true;
        return c.scope === scope || c.scope === "ALL";
      }) as any;
    }

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
        data: DEFAULT_CATEGORIES,
      },
      { status: 500 }
    );
  }
}

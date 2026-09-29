import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_SERVICES } from "@/lib/seedData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = { isPublished: true };
    if (category && category !== "All") {
      where.category = category;
    }

    let services = await prisma.service.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    if (services.length === 0 && !category) {
      services = DEFAULT_SERVICES as any;
    }

    return NextResponse.json({ success: true, data: services }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch services",
        details: error instanceof Error ? error.message : "Unknown error",
        data: DEFAULT_SERVICES,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getCompanyStats } from "@/lib/companyStats";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const stats = await getCompanyStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("API /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company stats" },
      { status: 500 }
    );
  }
}

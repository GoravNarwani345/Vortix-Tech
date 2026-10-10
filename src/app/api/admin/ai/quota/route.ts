import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAllDailyQuotas } from "@/lib/workloadQuota";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const quotas = await getAllDailyQuotas();
    return NextResponse.json({ success: true, quotas });
  } catch (error) {
    console.error("Failed to retrieve daily quotas:", error);
    return NextResponse.json(
      { error: "Failed to retrieve daily quotas" },
      { status: 500 }
    );
  }
}

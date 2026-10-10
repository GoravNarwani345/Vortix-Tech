import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { generateAiImage } from "@/lib/aiClient";
import {
  checkDailyImageQuota,
  incrementDailyImageUsage,
  DAILY_IMAGE_LIMIT,
} from "@/lib/imageQuota";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quota = await checkDailyImageQuota();
  return NextResponse.json({
    success: true,
    quota,
  });
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enforce system-wide daily limit of 5 images
  const quota = await checkDailyImageQuota();
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Daily limit reached: Only ${DAILY_IMAGE_LIMIT} AI image generations are permitted per day. Remaining quota will reset tomorrow.`,
        quota,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const prompt = body.prompt;
    const size = body.size || "1024x1024";

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid prompt is required for image generation." },
        { status: 400 }
      );
    }

    const result = await generateAiImage({
      prompt: prompt.trim(),
      size,
      model: body.model,
    });

    // Increment daily usage on success
    const updatedQuota = await incrementDailyImageUsage();

    return NextResponse.json({
      success: true,
      url: result.url,
      model: result.model,
      latencyMs: result.latencyMs,
      quota: {
        ...updatedQuota,
        limit: DAILY_IMAGE_LIMIT,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Image generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
        quota,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getStoredSettings } from "@/lib/settings";

export const revalidate = 30;

export async function GET() {
  try {
    const stored = await getStoredSettings();
    return NextResponse.json({
      success: true,
      hero: {
        badge:
          stored.HERO_BADGE ||
          "Full-Stack Engineering · AI Automation · CRM Pipelines · Cloud Systems",
        titlePrefix: stored.HERO_TITLE_PREFIX || "We Build",
        titleAccent: stored.HERO_TITLE_ACCENT || "Digital Systems",
        titleSuffix: stored.HERO_TITLE_SUFFIX || "That Drive Real Growth",
        subtitlePrefix: stored.HERO_SUBTITLE_PREFIX || "We engineer powerful",
        rotatingWords: stored.HERO_ROTATING_WORDS
          ? stored.HERO_ROTATING_WORDS.split(",").map((w) => w.trim()).filter(Boolean)
          : [
              "AI Agents & Autonomous Workflows",
              "Full-Stack Web & Mobile Apps",
              "CRM Pipeline Automations",
              "Enterprise n8n & ComfyUI Systems",
              "Cloud Infrastructure & APIs",
            ],
        description:
          stored.HERO_DESCRIPTION ||
          "From modern web applications and AI-powered automation to end-to-end CRM pipeline management and cloud infrastructure, Vortix Tech engineers the digital infrastructure that scales your business.",
        primaryCta: stored.HERO_PRIMARY_CTA || "Get a Quote",
        secondaryCta: stored.HERO_SECONDARY_CTA || "Explore Services",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load hero info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

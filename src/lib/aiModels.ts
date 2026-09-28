export type ModelTier = "free" | "paid";

export interface AIModelDefinition {
  id: string;
  name: string;
  tier: ModelTier;
  badge: string;
  speed: string;
  rateLimits: string;
  contextWindow: string;
  cost: string;
  tagline: string;
  description: string;
  bestFor: string;
  recommended?: boolean;
}

export const AI_MODELS: AIModelDefinition[] = [
  // ================= FREE TIER MODELS (Google AI Studio - $0 / No Credit Card) =================
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Fast (~250ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Latest Google flagship fast model for real-time chat & content",
    description: "Google's newest multimodal fast model with cutting-edge reasoning and instant responses at zero cost.",
    bestFor: "Customer support chat, contact inquiries, general Q&A, and real-time visitor assistance.",
    recommended: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Fast (~300ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,048,576 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "High-performance multimodal model for real-time interactions",
    description: "Next-generation model designed for low latency, advanced reasoning, and multimodal understanding.",
    bestFor: "Complex visitor inquiries, multi-turn reasoning, and instant chat.",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Light (~200ms)",
    rateLimits: "15 RPM • 1,500 RPD",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free tier in Google AI Studio",
    tagline: "Resource-friendly next-gen speed with compact footprint",
    description: "Streamlined 2.0 architecture designed for cost-free efficiency, fast turnaround, and minimal latency.",
    bestFor: "Quick visitor guidance, contact routing, and lightweight summaries.",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Very Fast (~450ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Lightweight, reliable workhorse for conversational Q&A",
    description: "Battle-tested, lightweight multimodal model optimized for efficiency, quick summaries, and low compute overhead.",
    bestFor: "Daily background cron jobs, blog topic generation, and standard website visitor conversations.",
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash-8B",
    tier: "free",
    badge: "Free Tier",
    speed: "Extreme Speed (~180ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Smallest & lowest latency model for high-frequency interactions",
    description: "8-billion parameter model purpose-built for sub-second responses and high volume operations with minimal resource usage.",
    bestFor: "Ultra-fast chat replies, simple classification, and high-frequency visitor inquiries.",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Light (~250ms)",
    rateLimits: "15 RPM • 1,500 RPD",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free tier in Google AI Studio",
    tagline: "Resource-friendly next-gen speed with compact footprint",
    description: "Streamlined 2.0 architecture designed for cost-free efficiency, fast turnaround, and minimal latency.",
    bestFor: "Quick visitor guidance, contact routing, and lightweight summaries.",
  },

  // ================= PAID / PRO TIER MODELS (Pay-As-You-Go / Higher Quota) =================
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tier: "paid",
    badge: "Pro / Paid",
    speed: "Moderate (~1.2s)",
    rateLimits: "Up to 1,000+ RPM (Tiered Billing)",
    contextWindow: "2,000,000 tokens",
    cost: "~$1.25 / 1M input • ~$5.00 / 1M output",
    tagline: "Maximum reasoning depth & multi-turn technical precision",
    description: "State-of-the-art reasoning model for complicated technical challenges, extensive code comprehension, and long-form content generation.",
    bestFor: "Deep technical articles, comprehensive proposal generation, and multi-file code analysis.",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    tier: "paid",
    badge: "Pro / Paid",
    speed: "Standard (~1.5s)",
    rateLimits: "Pay-as-you-go High Quota",
    contextWindow: "2,000,000 tokens",
    cost: "~$1.25 / 1M input • ~$5.00 / 1M output",
    tagline: "Massive 2 Million token context for deep repository & document analysis",
    description: "Handles massive amounts of information in a single prompt (e.g. an entire codebase or hundreds of pages of documentation).",
    bestFor: "Massive document digestion, complex architecture audits, and enterprise-grade reasoning.",
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    tier: "paid",
    badge: "Enterprise Paid",
    speed: "Deep Reasoning (~2s)",
    rateLimits: "High Throughput Enterprise Tier",
    contextWindow: "2,000,000+ tokens",
    cost: "Usage-based Cloud Billing",
    tagline: "Flagship next-gen reasoning model for enterprise workflows",
    description: "Cutting-edge generation model capable of sophisticated chain-of-thought analysis and autonomous technical execution.",
    bestFor: "Enterprise-grade autonomous workflows and complex reasoning pipelines.",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    tier: "paid",
    badge: "Next-Gen Paid",
    speed: "High-Throughput Fast",
    rateLimits: "Production Scaled Quota",
    contextWindow: "1,000,000 tokens",
    cost: "~$0.75 - $1.50 / 1M tokens",
    tagline: "Next-gen flagship high-throughput model for production scale",
    description: "The latest high-speed architecture offering rapid response times with expanded enterprise throughput limits.",
    bestFor: "High-traffic production applications and enterprise customer deployments.",
  },
];

export const FREE_AI_MODELS = AI_MODELS.filter((m) => m.tier === "free");
export const PAID_AI_MODELS = AI_MODELS.filter((m) => m.tier === "paid");

export function getModelById(id: string): AIModelDefinition {
  const found = AI_MODELS.find((m) => m.id === id);
  if (found) return found;
  return {
    id,
    name: id,
    tier: "free",
    badge: "Custom",
    speed: "Dynamic",
    rateLimits: "Dependent on Google API Key",
    contextWindow: "1,000,000 tokens",
    cost: "API dependent",
    tagline: "Custom configured Gemini model",
    description: `Custom model ID (${id}) configured via settings.`,
    bestFor: "Custom integrations and newer model releases.",
  };
}

export function isFreeModel(id: string): boolean {
  const model = AI_MODELS.find((m) => m.id === id);
  return model ? model.tier === "free" : true;
}

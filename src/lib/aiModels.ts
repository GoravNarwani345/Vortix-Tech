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
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Fast (~300ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Most reliable & fastest free-tier model with zero 503 high-demand errors",
    description: "Highly optimized multimodal fast model offering instant replies, stable availability, and high intelligence at zero cost.",
    bestFor: "Production website chat widget, contact inquiries, general Q&A, and fast visitor assistance.",
    recommended: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Light (~200ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free tier in Google AI Studio",
    tagline: "High-throughput, lightweight model for instant response turnaround",
    description: "Google's official replacement for Flash-Lite. Built for speed, high frequency calls, and minimal overhead.",
    bestFor: "Quick visitor guidance, FAQ lookups, and fast contact routing.",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Very Fast (~400ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Balanced multimodal intelligence for complex summaries and blogs",
    description: "Capable multimodal model with enhanced reasoning and broad knowledge base across code and technical concepts.",
    bestFor: "Daily background cron jobs, blog topic generation, and deep visitor inquiries.",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tier: "free",
    badge: "Free Tier",
    speed: "Ultra-Fast (~250ms)",
    rateLimits: "15 RPM • 1,500 RPD • 1M TPM",
    contextWindow: "1,000,000 tokens",
    cost: "$0.00 / Free forever in Google AI Studio",
    tagline: "Latest generation experimental model (may experience peak-hour demand)",
    description: "Google's newest experimental flash model with cutting-edge capabilities. Automatically fails over to 3.6 Flash if high demand spikes occur.",
    bestFor: "Testing newest capabilities, complex chat prompts, and bleeding-edge tasks.",
  },

  // ================= PAID / PRO TIER MODELS (Pay-As-You-Go / Higher Quota) =================
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    tier: "paid",
    badge: "Pro / Paid",
    speed: "Deep Reasoning (~1.8s)",
    rateLimits: "Paid Quota • High Throughput",
    contextWindow: "2,000,000 tokens",
    cost: "~$1.25 / 1M input • ~$5.00 / 1M output",
    tagline: "Google's official flagship Pro model for deep technical reasoning",
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

  // ================= AGENTROUTER / NEXT-GEN MODELS (DeepSeek Priority #1) =================
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    tier: "paid",
    badge: "Recommended #1 (Lowest Credits)",
    speed: "Ultra-Fast (~300ms)",
    rateLimits: "High Throughput Gateway",
    contextWindow: "1,000,000 tokens",
    cost: "Lowest API Credits",
    tagline: "Always First: Lowest credit cost & ultra-fast turnaround (~300ms)",
    description: "Highly efficient reasoning model that burns the fewest credits while delivering exceptional speed, coding skills, and multilingual reasoning.",
    bestFor: "High-volume customer chat, frequent automated tasks, and daily low-credit operations.",
    recommended: true,
  },
  {
    id: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    tier: "paid",
    badge: "AgentRouter / Efficient Reasoning",
    speed: "Medium Reasoning (~800ms)",
    rateLimits: "High Throughput Gateway",
    contextWindow: "1,000,000 tokens",
    cost: "Moderate Credits",
    tagline: "Balanced reasoning effort with low latency and high code accuracy",
    description: "Optimized reasoning model tuned with medium reasoning effort for rapid, high-accuracy completions.",
    bestFor: "Daily automated blog creation, SEO topic discovery, and interactive portfolio chat.",
  },
  {
    id: "gpt-6-astra",
    name: "GPT-6 Astra",
    tier: "paid",
    badge: "AgentRouter / Flagship",
    speed: "Deep Reasoning (~1.2s)",
    rateLimits: "High Throughput Gateway",
    contextWindow: "2,000,000 tokens",
    cost: "Higher Credits",
    tagline: "Next-gen flagship frontier model with extreme reasoning depth",
    description: "Frontier reasoning model with state-of-the-art multi-step deduction, code synthesis, and autonomous task execution.",
    bestFor: "Complex software architecture, advanced technical articles, and autonomous agent tasks.",
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    tier: "paid",
    badge: "AgentRouter / Anthropic",
    speed: "High-Precision (~1.1s)",
    rateLimits: "High Throughput Gateway",
    contextWindow: "1,000,000 tokens",
    cost: "Higher Credits",
    tagline: "High-precision analytical Opus model for deep technical auditing",
    description: "Balanced reasoning engine offering rigorous logic, exceptional code comprehension, and high accuracy.",
    bestFor: "Technical blogging, code debugging, and SEO project audits.",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    tier: "paid",
    badge: "AgentRouter / Anthropic Flagship",
    speed: "Deep Thought (~1.5s)",
    rateLimits: "High Throughput Gateway",
    contextWindow: "2,000,000 tokens",
    cost: "Premium Credits",
    tagline: "Anthropic's flagship next-generation Opus model with unprecedented nuance",
    description: "Unparalleled analytical reasoning, superior creative writing, and nuanced system analysis.",
    bestFor: "Long-form editorial writing, thorough code reviews, and enterprise solution architecture.",
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

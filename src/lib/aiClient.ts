import { getSetting } from "@/lib/settings";

export const AGENTROUTER_DEFAULT_MODELS = [
  "deepseek-v4-flash", // Always first (lowest credits)
  "gpt-5.6-sol",
  "gpt-6-astra",
  "claude-opus-4-8",
  "claude-opus-5",
];

export const AGENTROUTER_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "User-Agent": "claude-cli/0.2.29 (external, sdk-cli)",
  "anthropic-version": "2023-06-01",
  "anthropic-beta": "claude-code-20250219",
  "x-stainless-lang": "js",
  "x-stainless-package-version": "0.3.0",
  "x-stainless-os": "Windows",
  "x-stainless-arch": "x64",
  "x-stainless-runtime": "node",
  "anthropic-dangerous-direct-browser-access": "true",
};

export interface AiCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: string;
  customApiKey?: string;
  customBaseUrl?: string;
}

export interface AiCompletionResult {
  text: string;
  latencyMs: number;
  provider: "agentrouter" | "gemini";
  modelUsed: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ChatMessage {
  role: "user" | "model" | "assistant" | "system";
  content: string;
}

export interface AiChatOptions {
  messages: ChatMessage[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: string;
}

export interface ModelCheckResult {
  model: string;
  online: boolean;
  latencyMs: number;
  reply?: string;
  error?: string;
  costTier: string;
  recommended?: boolean;
}

export function isAgentRouterModel(modelId?: string): boolean {
  if (!modelId) return false;
  const lower = modelId.toLowerCase();
  return (
    AGENTROUTER_DEFAULT_MODELS.includes(lower) ||
    lower.startsWith("gpt-") ||
    lower.startsWith("claude-") ||
    lower.startsWith("deepseek-")
  );
}

/**
 * Execute multi-turn chat via AgentRouter (DeepSeek priority #1) with Gemini fallback
 */
export async function executeAiChat(
  options: AiChatOptions
): Promise<AiCompletionResult> {
  const {
    messages,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 800,
  } = options;

  const agentRouterKey =
    (await getSetting("AGENTROUTER_API_KEY")) ||
    process.env.AGENTROUTER_API_KEY;

  const agentRouterBaseUrl =
    (await getSetting("AGENTROUTER_BASE_URL")) ||
    process.env.AGENTROUTER_BASE_URL ||
    "https://agentrouter.org/v1";

  const configuredModel =
    options.model ||
    (await getSetting("AGENTROUTER_MODEL")) ||
    process.env.AGENTROUTER_MODEL ||
    (await getSetting("AI_MODEL")) ||
    "deepseek-v4-flash"; // Priority #1: Lowest Credits

  const reasoningEffort =
    options.reasoningEffort ||
    (await getSetting("AGENTROUTER_REASONING_EFFORT")) ||
    process.env.AGENTROUTER_REASONING_EFFORT ||
    "medium";

  // Try AgentRouter first if key is present
  if (agentRouterKey) {
    const startTime = Date.now();
    const endpoint = `${agentRouterBaseUrl.replace(/\/+$/, "")}/chat/completions`;

    const openAiMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.map((m) => ({
        role: m.role === "model" ? "assistant" : m.role === "system" ? "system" : "user",
        content: m.content,
      })),
    ];

    const isDeepSeek = configuredModel.toLowerCase().includes("deepseek");
    const payload: Record<string, unknown> = {
      model: configuredModel,
      messages: openAiMessages,
      max_tokens: maxTokens,
    };

    if (!isDeepSeek && reasoningEffort) {
      payload.reasoning_effort = reasoningEffort;
    } else {
      payload.temperature = temperature;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...AGENTROUTER_HEADERS,
          Authorization: `Bearer ${agentRouterKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        return {
          text,
          latencyMs: Date.now() - startTime,
          provider: "agentrouter",
          modelUsed: configuredModel,
          usage: {
            promptTokens: data.usage?.prompt_tokens,
            completionTokens: data.usage?.completion_tokens,
            totalTokens: data.usage?.total_tokens,
          },
        };
      } else {
        const errText = await res.text();
        console.warn(`AgentRouter chat attempt returned HTTP ${res.status}: ${errText}. Attempting fallback.`);
      }
    } catch (agentRouterErr) {
      console.warn("AgentRouter network error during chat:", agentRouterErr);
    }
  }

  // Fallback to Gemini
  const geminiKey =
    (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error(
      "No active AI provider reachable. Please configure AgentRouter API key or Gemini API key."
    );
  }

  const geminiModel =
    isAgentRouterModel(configuredModel) ? "gemini-3.6-flash" : configuredModel;

  const startTime = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

  const geminiContents = messages.map((m) => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(systemPrompt
        ? { system_instruction: { parts: [{ text: systemPrompt }] } }
        : {}),
      contents: geminiContents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    text,
    latencyMs,
    provider: "gemini",
    modelUsed: geminiModel,
    usage: {
      totalTokens: data.usageMetadata?.totalTokenCount,
    },
  };
}

/**
 * Execute completion via AgentRouter (DeepSeek priority #1) or Gemini fallback
 */
export async function executeAiCompletion(
  options: AiCompletionOptions
): Promise<AiCompletionResult> {
  const {
    prompt,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  const agentRouterKey =
    options.customApiKey ||
    (await getSetting("AGENTROUTER_API_KEY")) ||
    process.env.AGENTROUTER_API_KEY;

  const agentRouterBaseUrl =
    options.customBaseUrl ||
    (await getSetting("AGENTROUTER_BASE_URL")) ||
    process.env.AGENTROUTER_BASE_URL ||
    "https://agentrouter.org/v1";

  const configuredModel =
    options.model ||
    (await getSetting("AGENTROUTER_MODEL")) ||
    process.env.AGENTROUTER_MODEL ||
    (await getSetting("AI_MODEL")) ||
    "deepseek-v4-flash";

  const reasoningEffort =
    options.reasoningEffort ||
    (await getSetting("AGENTROUTER_REASONING_EFFORT")) ||
    process.env.AGENTROUTER_REASONING_EFFORT ||
    "medium";

  // If AgentRouter is configured or model is an AgentRouter model
  if (agentRouterKey && (isAgentRouterModel(configuredModel) || !process.env.GEMINI_API_KEY)) {
    const startTime = Date.now();
    const endpoint = `${agentRouterBaseUrl.replace(/\/+$/, "")}/chat/completions`;

    const messages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: prompt },
    ];

    const isDeepSeek = configuredModel.toLowerCase().includes("deepseek");

    const payload: Record<string, unknown> = {
      model: configuredModel,
      messages,
      max_tokens: maxTokens,
    };

    // DeepSeek and reasoning models configuration
    if (!isDeepSeek && reasoningEffort) {
      payload.reasoning_effort = reasoningEffort;
    } else {
      payload.temperature = temperature;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...AGENTROUTER_HEADERS,
        Authorization: `Bearer ${agentRouterKey}`,
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try {
        const j = JSON.parse(errText);
        msg = j.error?.message || errText;
      } catch {
        // Raw text
      }
      throw new Error(`AgentRouter Error (${res.status}): ${msg}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text,
      latencyMs,
      provider: "agentrouter",
      modelUsed: configuredModel,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  // Fallback to Google Gemini
  const geminiKey =
    (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    throw new Error(
      "No AI provider configured. Please provide an AgentRouter API key or Gemini API key in settings."
    );
  }

  const geminiModel =
    isAgentRouterModel(configuredModel) ? "gemini-3.8-flash" : configuredModel;

  const startTime = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(systemPrompt
        ? { system_instruction: { parts: [{ text: systemPrompt }] } }
        : {}),
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text();
    let msg = errText;
    try {
      const j = JSON.parse(errText);
      msg = j.error?.message || errText;
    } catch {
      // Raw text
    }
    throw new Error(`Gemini Error (${res.status}): ${msg}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    text,
    latencyMs,
    provider: "gemini",
    modelUsed: geminiModel,
    usage: {
      totalTokens: data.usageMetadata?.totalTokenCount,
    },
  };
}

/**
 * Test a single model connectivity via AgentRouter
 */
export async function testSingleModel(
  model: string,
  apiKey: string,
  baseUrl = "https://agentrouter.org/v1"
): Promise<ModelCheckResult> {
  const isDeepSeek = model.toLowerCase().includes("deepseek");
  const costTier = isDeepSeek
    ? "Lowest Credits (Priority #1)"
    : model.includes("5.6-sol")
    ? "Moderate Credits"
    : model.includes("opus-5")
    ? "Premium Credits"
    : "Higher Credits";

  const startTime = Date.now();
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  try {
    const payload: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 20,
    };

    if (!isDeepSeek) {
      payload.reasoning_effort = "medium";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...AGENTROUTER_HEADERS,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try {
        const j = JSON.parse(errText);
        msg = j.error?.message || errText;
      } catch {
        // Raw text
      }
      return {
        model,
        online: false,
        latencyMs,
        error: `HTTP ${res.status}: ${msg}`,
        costTier,
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "OK";

    return {
      model,
      online: true,
      latencyMs,
      reply,
      costTier,
      recommended: isDeepSeek,
    };
  } catch (err) {
    return {
      model,
      online: false,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : "Network error",
      costTier,
      recommended: isDeepSeek,
    };
  }
}

/**
 * Diagnostic test across all available models (DeepSeek always checked first)
 */
export async function checkAvailableModels(
  apiKey: string,
  baseUrl = "https://agentrouter.org/v1",
  modelsList: string[] = AGENTROUTER_DEFAULT_MODELS
): Promise<ModelCheckResult[]> {
  // DeepSeek is always checked first to verify low-credit availability first
  const deepSeekModels = modelsList.filter((m) => m.toLowerCase().includes("deepseek"));
  const otherModels = modelsList.filter((m) => !m.toLowerCase().includes("deepseek"));

  const results: ModelCheckResult[] = [];

  // Check DeepSeek first
  for (const m of deepSeekModels) {
    const res = await testSingleModel(m, apiKey, baseUrl);
    results.push(res);
  }

  // Check the remaining models
  const otherResults = await Promise.all(
    otherModels.map((m) => testSingleModel(m, apiKey, baseUrl))
  );
  results.push(...otherResults);

  return results;
}

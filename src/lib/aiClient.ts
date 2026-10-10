import OpenAI from "openai";
import { getSetting } from "@/lib/settings";

export const AGENTROUTER_DEFAULT_MODELS = [
  "DeepSeek-V4-Flash",
  "DeepSeek-V4.1-Flash",
  "DeepSeek-V4-Pro",
  "glm-5.3-flash",
  "glm-5.3",
  "kimi-k3",
  "step-5-preview",
  "auto",
  "deepseek-v4-flash",
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

export type AiTaskType = "chat" | "blog" | "research" | "audit" | "cron";

export interface AiCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: string;
  customApiKey?: string;
  customBaseUrl?: string;
  task?: AiTaskType;
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
  task?: AiTaskType;
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
    AGENTROUTER_DEFAULT_MODELS.some((m) => m.toLowerCase() === lower) ||
    lower.startsWith("gpt-") ||
    lower.startsWith("claude-") ||
    lower.startsWith("deepseek-") ||
    lower.startsWith("glm-") ||
    lower.startsWith("kimi-") ||
    lower.startsWith("step-") ||
    lower === "auto"
  );
}

/**
 * Resolve effective primary provider, secondary provider, and model based on task-specific overrides and global settings.
 */
export async function resolveTaskRouting(
  task?: AiTaskType,
  overrideModel?: string
): Promise<{
  effectivePrimary: "agentrouter" | "gemini";
  effectiveSecondary: "agentrouter" | "gemini" | "none";
  effectiveModel: string;
}> {
  let taskProvider: "default" | "agentrouter" | "gemini" | undefined;
  let taskModel: string | undefined;

  if (task === "chat") {
    taskProvider = await getSetting("AI_TASK_CHAT_PROVIDER");
    taskModel = await getSetting("AI_TASK_CHAT_MODEL");
  } else if (task === "blog" || task === "cron") {
    taskProvider = await getSetting("AI_TASK_BLOG_PROVIDER");
    taskModel = await getSetting("AI_TASK_BLOG_MODEL");
  } else if (task === "research") {
    taskProvider = await getSetting("AI_TASK_RESEARCH_PROVIDER");
    taskModel = await getSetting("AI_TASK_RESEARCH_MODEL");
  } else if (task === "audit") {
    taskProvider = await getSetting("AI_TASK_AUDIT_PROVIDER");
    taskModel = await getSetting("AI_TASK_AUDIT_MODEL");
  }

  // Global default primary is agentrouter
  const globalPrimary =
    (await getSetting("AI_PRIMARY_PROVIDER")) ||
    (await getSetting("AI_PROVIDER")) ||
    "agentrouter";

  const effectivePrimary: "agentrouter" | "gemini" =
    taskProvider && taskProvider !== "default"
      ? (taskProvider as "agentrouter" | "gemini")
      : (globalPrimary as "agentrouter" | "gemini");

  const globalSecondary =
    (await getSetting("AI_SECONDARY_PROVIDER")) ||
    (effectivePrimary === "agentrouter" ? "gemini" : "agentrouter");

  const effectiveSecondary: "agentrouter" | "gemini" | "none" =
    globalSecondary as "agentrouter" | "gemini" | "none";

  const effectiveModel =
    overrideModel ||
    (taskModel && taskModel.trim() !== "" ? taskModel.trim() : null) ||
    (await getSetting("AGENTROUTER_MODEL")) ||
    process.env.AGENTROUTER_MODEL ||
    (await getSetting("AI_MODEL")) ||
    "DeepSeek-V4-Flash";

  return {
    effectivePrimary,
    effectiveSecondary,
    effectiveModel,
  };
}

/**
 * Execute multi-turn chat respecting Primary and Secondary provider hierarchy with automatic failover
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
    process.env.AGENTROUTER_API_KEY ||
    (await getSetting("IMAGE_API_KEY")) ||
    process.env.IMAGE_API_KEY ||
    process.env.NEW_API_KEY;

  const agentRouterBaseUrl =
    (await getSetting("AGENTROUTER_BASE_URL")) ||
    process.env.AGENTROUTER_BASE_URL ||
    (await getSetting("IMAGE_BASE_URL")) ||
    process.env.IMAGE_BASE_URL ||
    "https://api.hcnsec.cn/v1";

  const { effectivePrimary, effectiveSecondary, effectiveModel } =
    await resolveTaskRouting(options.task || "chat", options.model);

  const configuredModel = effectiveModel;

  const reasoningEffort =
    options.reasoningEffort ||
    (await getSetting("AGENTROUTER_REASONING_EFFORT")) ||
    process.env.AGENTROUTER_REASONING_EFFORT ||
    "medium";

  const geminiKey =
    (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

  const providersToTry: Array<"agentrouter" | "gemini"> = [];
  if (effectivePrimary === "agentrouter" && agentRouterKey) providersToTry.push("agentrouter");
  else if (effectivePrimary === "gemini" && geminiKey) providersToTry.push("gemini");

  if (effectiveSecondary === "agentrouter" && agentRouterKey && !providersToTry.includes("agentrouter")) {
    providersToTry.push("agentrouter");
  } else if (effectiveSecondary === "gemini" && geminiKey && !providersToTry.includes("gemini")) {
    providersToTry.push("gemini");
  }

  if (providersToTry.length === 0) {
    if (agentRouterKey) providersToTry.push("agentrouter");
    if (geminiKey) providersToTry.push("gemini");
  }

  if (providersToTry.length === 0) {
    throw new Error(
      "No active AI provider reachable. Please configure Gateway API key or Gemini API key."
    );
  }

  let lastError: Error | null = null;

  for (const prov of providersToTry) {
    try {
      if (prov === "agentrouter") {
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

        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agentRouterKey}`,
        };
        if (agentRouterBaseUrl.includes("agentrouter.org")) {
          Object.assign(reqHeaders, AGENTROUTER_HEADERS);
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: reqHeaders,
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
          throw new Error(`Gateway Error (${res.status}): ${errText}`);
        }
      } else if (prov === "gemini") {
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
    } catch (err) {
      console.warn(`Provider [${prov}] failed during chat, attempting failover:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("All configured AI providers failed during chat.");
}

/**
 * Execute completion respecting Primary and Secondary provider hierarchy with automatic failover
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
    process.env.AGENTROUTER_API_KEY ||
    (await getSetting("IMAGE_API_KEY")) ||
    process.env.IMAGE_API_KEY ||
    process.env.NEW_API_KEY;

  const agentRouterBaseUrl =
    options.customBaseUrl ||
    (await getSetting("AGENTROUTER_BASE_URL")) ||
    process.env.AGENTROUTER_BASE_URL ||
    (await getSetting("IMAGE_BASE_URL")) ||
    process.env.IMAGE_BASE_URL ||
    "https://api.hcnsec.cn/v1";

  const { effectivePrimary, effectiveSecondary, effectiveModel } =
    await resolveTaskRouting(options.task, options.model);

  const configuredModel = effectiveModel;

  const reasoningEffort =
    options.reasoningEffort ||
    (await getSetting("AGENTROUTER_REASONING_EFFORT")) ||
    process.env.AGENTROUTER_REASONING_EFFORT ||
    "medium";

  const geminiKey =
    (await getSetting("GEMINI_API_KEY")) || process.env.GEMINI_API_KEY;

  const providersToTry: Array<"agentrouter" | "gemini"> = [];
  if (effectivePrimary === "agentrouter" && agentRouterKey) providersToTry.push("agentrouter");
  else if (effectivePrimary === "gemini" && geminiKey) providersToTry.push("gemini");

  if (effectiveSecondary === "agentrouter" && agentRouterKey && !providersToTry.includes("agentrouter")) {
    providersToTry.push("agentrouter");
  } else if (effectiveSecondary === "gemini" && geminiKey && !providersToTry.includes("gemini")) {
    providersToTry.push("gemini");
  }

  if (providersToTry.length === 0) {
    if (agentRouterKey) providersToTry.push("agentrouter");
    if (geminiKey) providersToTry.push("gemini");
  }

  if (providersToTry.length === 0) {
    throw new Error(
      "No active AI provider configured. Please provide an OpenAI Gateway or Gemini API key in settings."
    );
  }

  let lastError: Error | null = null;

  for (const prov of providersToTry) {
    try {
      if (prov === "agentrouter") {
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

        if (!isDeepSeek && reasoningEffort) {
          payload.reasoning_effort = reasoningEffort;
        } else {
          payload.temperature = temperature;
        }

        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agentRouterKey}`,
        };
        if (agentRouterBaseUrl.includes("agentrouter.org")) {
          Object.assign(reqHeaders, AGENTROUTER_HEADERS);
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify(payload),
        });

        const latencyMs = Date.now() - startTime;

        if (res.ok) {
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
        } else {
          const errText = await res.text();
          throw new Error(`Gateway Error (${res.status}): ${errText}`);
        }
      } else if (prov === "gemini") {
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
    } catch (err) {
      console.warn(`Provider [${prov}] failed during completion, attempting failover:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("All configured AI providers failed during completion.");
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

export interface AiImageOptions {
  prompt: string;
  size?: "1024x1024" | "512x512" | "256x256";
  model?: string;
  customApiKey?: string;
  customBaseUrl?: string;
}

export interface AiImageResult {
  url: string;
  model: string;
  latencyMs: number;
}

/**
 * Generate images using OpenAI-compatible image endpoints (e.g. StepFun step-image-edit-2)
 */
export async function generateAiImage(
  options: AiImageOptions
): Promise<AiImageResult> {
  const { prompt, size = "1024x1024" } = options;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("A prompt is required for image generation.");
  }

  const apiKey =
    options.customApiKey ||
    (await getSetting("IMAGE_API_KEY")) ||
    process.env.IMAGE_API_KEY ||
    process.env.NEW_API_KEY ||
    (await getSetting("AGENTROUTER_API_KEY")) ||
    process.env.AGENTROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No image generation API key configured. Please configure IMAGE_API_KEY in settings or environment variables."
    );
  }

  const baseUrl =
    options.customBaseUrl ||
    (await getSetting("IMAGE_BASE_URL")) ||
    process.env.IMAGE_BASE_URL ||
    "https://api.hcnsec.cn/v1";

  const model =
    options.model ||
    (await getSetting("IMAGE_MODEL")) ||
    process.env.IMAGE_MODEL ||
    "step-image-edit-2";

  const startTime = Date.now();
  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey,
  });

  const response = await client.images.generate({
    model,
    prompt: prompt.trim(),
    size,
    n: 1,
    response_format: "url",
  });

  const url = response.data?.[0]?.url;
  if (!url) {
    throw new Error("The image provider did not return an image URL.");
  }

  return {
    url,
    model,
    latencyMs: Date.now() - startTime,
  };
}


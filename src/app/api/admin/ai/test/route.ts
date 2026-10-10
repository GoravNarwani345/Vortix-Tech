import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAiKnowledge } from "@/lib/aiKnowledge";
import { getSetting } from "@/lib/settings";
import {
  executeAiCompletion,
  checkAvailableModels,
  AGENTROUTER_DEFAULT_MODELS,
} from "@/lib/aiClient";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // ACTION 1: Check connectivity and latency across available models for Gateway or AgentRouter
    if (body.action === "check-models") {
      const isGateway = body.provider === "gateway" || body.baseUrl?.includes("hcnsec");
      const apiKey =
        body.apiKey ||
        (isGateway
          ? (await getSetting("GATEWAY_API_KEY")) ||
            process.env.GATEWAY_API_KEY ||
            (await getSetting("IMAGE_API_KEY")) ||
            process.env.IMAGE_API_KEY ||
            process.env.NEW_API_KEY
          : (await getSetting("AGENTROUTER_API_KEY")) ||
            process.env.AGENTROUTER_API_KEY);

      if (!apiKey) {
        return NextResponse.json(
          {
            error: isGateway
              ? "Please enter or configure your OpenAI Gateway API key to test models."
              : "Please enter or configure your AgentRouter API key to test models.",
          },
          { status: 400 }
        );
      }

      const baseUrl =
        body.baseUrl ||
        (isGateway
          ? (await getSetting("GATEWAY_BASE_URL")) ||
            process.env.GATEWAY_BASE_URL ||
            "https://api.hcnsec.cn/v1"
          : (await getSetting("AGENTROUTER_BASE_URL")) ||
            process.env.AGENTROUTER_BASE_URL ||
            "https://agentrouter.org/v1");

      const modelsToTest =
        Array.isArray(body.models) && body.models.length > 0
          ? body.models
          : isGateway
          ? ["DeepSeek-V4-Flash", "DeepSeek-V4.1-Flash", "DeepSeek-V4-Pro", "glm-5.3-flash", "kimi-k3"]
          : AGENTROUTER_DEFAULT_MODELS;

      const results = await checkAvailableModels(apiKey, baseUrl, modelsToTest);

      return NextResponse.json({
        success: true,
        models: results,
      });
    }

    // ACTION 2: Run a live test prompt against the active or requested model
    const prompt = body.prompt;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter a test prompt or visitor question." },
        { status: 400 }
      );
    }

    const systemPromptText = await getAiKnowledge();
    const modelToUse = body.model;

    const result = await executeAiCompletion({
      prompt: prompt.trim(),
      systemPrompt: systemPromptText,
      model: modelToUse,
      customApiKey: body.apiKey,
      customBaseUrl: body.baseUrl,
      temperature: body.temperature,
      maxTokens: body.maxTokens || 800,
    });

    return NextResponse.json({
      success: true,
      reply: result.text,
      latencyMs: result.latencyMs,
      modelUsed: result.modelUsed,
      provider: result.provider,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI Test error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Test request failed",
      },
      { status: 500 }
    );
  }
}

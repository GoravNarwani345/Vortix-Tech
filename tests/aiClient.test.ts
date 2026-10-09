import { describe, it, expect } from "bun:test";
import {
  AGENTROUTER_DEFAULT_MODELS,
  isAgentRouterModel,
} from "@/lib/aiClient";
import { AI_MODELS, getModelById } from "@/lib/aiModels";

describe("AI Gateway & Model Priority Suite", () => {
  it("should have deepseek-v4-flash as the very first default model", () => {
    expect(AGENTROUTER_DEFAULT_MODELS.length).toBeGreaterThan(0);
    expect(AGENTROUTER_DEFAULT_MODELS[0]).toBe("deepseek-v4-flash");
  });

  it("should recognize DeepSeek models as AgentRouter models", () => {
    expect(isAgentRouterModel("deepseek-v4-flash")).toBe(true);
    expect(isAgentRouterModel("gpt-5.6-sol")).toBe(true);
    expect(isAgentRouterModel("claude-opus-5")).toBe(true);
    expect(isAgentRouterModel("gemini-3.6-flash")).toBe(false);
  });

  it("should mark deepseek-v4-flash as recommended with lowest credits in catalog", () => {
    const deepSeek = getModelById("deepseek-v4-flash");
    expect(deepSeek).toBeDefined();
    expect(deepSeek.recommended).toBe(true);
    expect(deepSeek.cost).toContain("Lowest");
    expect(deepSeek.badge).toContain("Lowest Credits");
  });

  it("should include all 5 next-gen AgentRouter models in AI_MODELS", () => {
    const ids = AI_MODELS.map((m) => m.id);
    expect(ids).toContain("deepseek-v4-flash");
    expect(ids).toContain("gpt-5.6-sol");
    expect(ids).toContain("gpt-6-astra");
    expect(ids).toContain("claude-opus-4-8");
    expect(ids).toContain("claude-opus-5");
  });
});

import { describe, it, expect } from "bun:test";
import {
  compileAiKnowledge,
  syncAiKnowledge,
  getAiKnowledge,
  getAiKnowledgeAudit,
} from "@/lib/aiKnowledge";

describe("AI Knowledge Engine", () => {
  it("compileAiKnowledge should generate structured prompt with all core sections", async () => {
    const result = await compileAiKnowledge();

    expect(result).toBeDefined();
    expect(result.compiledPrompt.length).toBeGreaterThan(500);
    expect(result.totalChars).toBeGreaterThan(500);
    expect(result.estimatedTokens).toBeGreaterThan(100);

    // Verify key business entities are embedded
    expect(result.compiledPrompt).toContain("Vortix Tech");
    expect(result.compiledPrompt).toContain("Mobile App Development");
    expect(result.compiledPrompt).toContain("Web Application Development");
    expect(result.compiledPrompt).toContain("n8n Workflow Automation");
    expect(result.compiledPrompt).toContain("ComfyUI Workflows");
    expect(result.compiledPrompt).toContain("LLM Solutions");

    // Verify source breakdown has entries
    expect(result.breakdown.length).toBeGreaterThanOrEqual(5);
    const companySource = result.breakdown.find((b) => b.name.includes("Company"));
    expect(companySource).toBeDefined();
  });

  it("syncAiKnowledge should cache knowledge and record audit history entry", async () => {
    const syncResult = await syncAiKnowledge("manual");

    expect(syncResult).toBeDefined();
    expect(syncResult.lastSyncedAt).toBeDefined();
    expect(syncResult.nextScheduledSyncAt).toBeDefined();
    expect(syncResult.history).toBeDefined();
    expect(syncResult.history.length).toBeGreaterThanOrEqual(1);

    const latest = syncResult.history[0];
    expect(latest.status).toBe("success");
    expect(latest.trigger).toBe("manual");
    expect(latest.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("getAiKnowledge should return compiled prompt for chatbot injection", async () => {
    const prompt = await getAiKnowledge();
    expect(prompt).toBeDefined();
    expect(typeof prompt).toBe("string");
    expect(prompt.includes("Vortix Tech")).toBe(true);
  });

  it("getAiKnowledgeAudit should return full audit data", async () => {
    const audit = await getAiKnowledgeAudit();
    expect(audit.compiledPrompt).toBeDefined();
    expect(audit.breakdown.length).toBeGreaterThan(0);
    expect(audit.history.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from "bun:test";
import {
  AI_MODELS,
  FREE_AI_MODELS,
  PAID_AI_MODELS,
  getModelById,
  isFreeModel,
} from "@/lib/aiModels";

describe("AI Models Catalog", () => {
  it("should have both free and paid model categories", () => {
    expect(FREE_AI_MODELS.length).toBeGreaterThan(0);
    expect(PAID_AI_MODELS.length).toBeGreaterThan(0);
    expect(AI_MODELS.length).toBe(FREE_AI_MODELS.length + PAID_AI_MODELS.length);
  });

  it("should correctly identify free tier models", () => {
    expect(isFreeModel("gemini-3.8-flash")).toBe(true);
    expect(isFreeModel("gemini-2.0-flash")).toBe(true);
    expect(isFreeModel("gemini-1.5-flash")).toBe(true);
    expect(isFreeModel("gemini-1.5-flash-8b")).toBe(true);
    expect(isFreeModel("gemini-2.0-flash-lite")).toBe(true);
  });

  it("should correctly identify paid / pro models", () => {
    expect(isFreeModel("gemini-2.5-pro")).toBe(false);
    expect(isFreeModel("gemini-1.5-pro")).toBe(false);
    expect(isFreeModel("gemini-3.1-pro")).toBe(false);
  });

  it("should provide complete specifications for each model", () => {
    for (const model of AI_MODELS) {
      expect(model.id).toBeDefined();
      expect(model.name).toBeDefined();
      expect(model.tier).toMatch(/^(free|paid)$/);
      expect(model.speed).toBeDefined();
      expect(model.rateLimits).toBeDefined();
      expect(model.cost).toBeDefined();
      expect(model.bestFor).toBeDefined();
    }
  });

  it("should retrieve model by ID with fallback for custom model IDs", () => {
    const defaultModel = getModelById("gemini-3.8-flash");
    expect(defaultModel.name).toBe("Gemini 3.8 Flash");
    expect(defaultModel.tier).toBe("free");

    const customModel = getModelById("gemini-custom-future-99");
    expect(customModel.id).toBe("gemini-custom-future-99");
    expect(customModel.badge).toBe("Custom");
  });
});

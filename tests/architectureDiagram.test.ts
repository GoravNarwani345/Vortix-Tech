import { describe, it, expect } from "bun:test";
import { isAsciiDiagram, parseAsciiStages } from "@/components/blog/ArticleContent";

describe("Architecture Diagram Parser & Detection", () => {
  const sampleDiagram = `
┌────────────────────────────────────────────────────────┐
│ INGESTION LAYER                                        │
│ Shopify webhooks -> Queue -> Normalizer -> Structure-aware Chunker │
│ (products, variants, policies, reviews, helpdesk macros, PDFs)     │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ INDEX LAYER                                            │
│ Embedding model (multilingual, Matryoshka)  ┐          │
│ BM25 / sparse index (lexical)               ├─> Hybrid index
│ Metadata store (price, stock, tags, locale) ┘   + Reranker
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ RETRIEVAL LAYER                                        │
│ Query rewrite -> Route (policy vs. product vs. order) -> Hybrid search │
│ -> Filter (locale, channel, stock) -> Cross-encoder rerank -> Context  │
└────────────────────────────────────────────────────────┘
`;

  it("should detect ASCII box diagrams accurately", () => {
    expect(isAsciiDiagram(sampleDiagram)).toBe(true);
  });

  it("should not falsely flag normal programming code", () => {
    const code = `
function calculateTax(price: number, rate: number): number {
  if (price <= 0) return 0;
  return price * rate;
}
`;
    expect(isAsciiDiagram(code)).toBe(false);
  });

  it("should extract all 3 stages from the diagram", () => {
    const stages = parseAsciiStages(sampleDiagram);
    expect(stages.length).toBe(3);

    // Stage 1
    expect(stages[0].title).toContain("INGESTION LAYER");
    expect(stages[0].flowSteps.length).toBeGreaterThanOrEqual(3);
    expect(stages[0].flowSteps).toContain("Shopify webhooks");

    // Stage 2
    expect(stages[1].title).toContain("INDEX LAYER");

    // Stage 3
    expect(stages[2].title).toContain("RETRIEVAL LAYER");
  });
});

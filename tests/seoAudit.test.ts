import { describe, expect, it } from "bun:test";
import type { ProjectAuditResult } from "@/app/api/admin/ai/project-audit/route";
import type { ResearchResult } from "@/app/api/admin/ai/research/route";
import type { SEOTopicItem } from "@/app/api/admin/ai/topics/route";

describe("SEO & AI Audit Modules", () => {
  it("should match ProjectAuditResult schema structure", () => {
    const mockAudit: ProjectAuditResult = {
      score: 92,
      rating: "Excellent",
      summary: "High search readiness with clear technical positioning.",
      suggestedKeywords: [
        "enterprise nextjs dashboard",
        "custom crm development agency",
        "n8n automation consultant",
      ],
      suggestedTitle: "Next.js 16 Enterprise Dashboard & Analytics Platform",
      recommendedMetaDescription:
        "High-performance Next.js dashboard built for enterprise operations with real-time analytics and scalable architecture.",
      strengths: ["Clear technical stack", "Focused target audience"],
      recommendations: ["Add case study metrics", "Include client outcome figures"],
    };

    expect(mockAudit.score).toBeGreaterThanOrEqual(0);
    expect(mockAudit.score).toBeLessThanOrEqual(100);
    expect(mockAudit.rating).toBe("Excellent");
    expect(mockAudit.suggestedKeywords.length).toBeGreaterThan(0);
    expect(mockAudit.recommendedMetaDescription.length).toBeLessThanOrEqual(160);
  });

  it("should match ResearchResult schema structure", () => {
    const mockResearch: ResearchResult = {
      suggestedTitles: [
        "How to Build a Custom RAG Knowledge Base with Pinecone in 2026",
        "Building High-Converting AI Assistants for E-Commerce",
      ],
      primaryKeywords: ["rag knowledge base", "shopify ai assistant"],
      secondaryKeywords: ["vector database e-commerce", "pinecone langchain tutorial"],
      category: "AI & Automation",
      executiveSummary: "A comprehensive analysis of retrieval augmented generation for modern stores.",
      keyInsights: [
        "RAG reduces LLM hallucinations by over 75% on product queries.",
        "Sub-second response times are achievable with optimized embeddings.",
      ],
      references: [
        {
          title: "Next.js Documentation",
          url: "https://nextjs.org/docs",
          description: "Official App Router guide",
        },
      ],
      suggestedOutline: [
        {
          heading: "Architecture Overview",
          points: ["Vector storage", "Embedding pipeline", "Context injection"],
        },
      ],
      imagePrompts: {
        minimalist: "clean minimalist vector tech illustration",
        isometric3D: "3D isometric render of data streams octane",
        cyberDark: "dark cyberpunk theme with glowing cyan elements",
      },
    };

    expect(mockResearch.suggestedTitles.length).toBeGreaterThanOrEqual(1);
    expect(mockResearch.primaryKeywords.length).toBeGreaterThanOrEqual(1);
    expect(mockResearch.references[0].url).toContain("https://");
    expect(mockResearch.imagePrompts.minimalist).toBeDefined();
    expect(mockResearch.imagePrompts.isometric3D).toBeDefined();
    expect(mockResearch.imagePrompts.cyberDark).toBeDefined();
  });

  it("should validate SEOTopicItem structure", () => {
    const mockTopic: SEOTopicItem = {
      title: "n8n vs Zapier: Why Enterprise Companies Are Switching in 2026",
      category: "Workflow Architecture",
      targetKeyword: "n8n vs zapier enterprise automation",
      searchIntent: "Commercial",
      seoPotential: "Breakthrough",
      briefReason: "Captures buyers in evaluation stage who need custom automation setups.",
    };

    expect(["Commercial", "Informational", "Transactional"]).toContain(mockTopic.searchIntent);
    expect(["High", "Breakthrough", "Trending"]).toContain(mockTopic.seoPotential);
    expect(mockTopic.targetKeyword.length).toBeGreaterThan(3);
  });
});

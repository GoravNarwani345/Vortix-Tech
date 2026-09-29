import { describe, it, expect } from "bun:test";
import { DEFAULT_CATEGORIES, DEFAULT_SERVICES } from "../src/lib/seedData";
import { slugify } from "../src/lib/utils";

describe("Categories & Services Architecture", () => {
  it("should have valid default categories with proper scopes", () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(5);

    const scopes = DEFAULT_CATEGORIES.map((c) => c.scope);
    expect(scopes).toContain("ALL");
    expect(scopes).toContain("PORTFOLIO");

    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.name).toBeDefined();
      expect(cat.slug).toBe(slugify(cat.slug));
      expect(cat.order).toBeGreaterThanOrEqual(0);
    }
  });

  it("should have all 8 default engineering services with complete features", () => {
    expect(DEFAULT_SERVICES.length).toBe(8);

    for (const svc of DEFAULT_SERVICES) {
      expect(svc.title.length).toBeGreaterThan(3);
      expect(svc.slug).toBe(slugify(svc.slug));
      expect(svc.category.length).toBeGreaterThan(0);
      expect(svc.description.length).toBeGreaterThan(20);
      expect(svc.features.length).toBeGreaterThanOrEqual(3);
      expect(svc.icon).toBeDefined();
      expect(svc.isPublished).toBe(true);
    }
  });

  it("should ensure all services map to a recognized category", () => {
    const categoryNames = DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase());

    for (const svc of DEFAULT_SERVICES) {
      const match = categoryNames.some(
        (cn) => cn === svc.category.toLowerCase() || svc.category.toLowerCase().includes(cn)
      );
      expect(match).toBe(true);
    }
  });
});

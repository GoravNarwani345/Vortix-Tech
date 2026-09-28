import { describe, it, expect } from "bun:test";

describe("Public Shell & Route Guard Logic", () => {
  function shouldExcludePublicChrome(pathname: string | null | undefined): boolean {
    return Boolean(pathname?.startsWith("/admin"));
  }

  it("should hide public navbar/footer on admin routes", () => {
    expect(shouldExcludePublicChrome("/admin")).toBe(true);
    expect(shouldExcludePublicChrome("/admin/settings")).toBe(true);
    expect(shouldExcludePublicChrome("/admin/feedback")).toBe(true);
    expect(shouldExcludePublicChrome("/admin/blog/new")).toBe(true);
    expect(shouldExcludePublicChrome("/admin/login")).toBe(true);
  });

  it("should show public navbar/footer on public pages", () => {
    expect(shouldExcludePublicChrome("/")).toBe(false);
    expect(shouldExcludePublicChrome("/about")).toBe(false);
    expect(shouldExcludePublicChrome("/services")).toBe(false);
    expect(shouldExcludePublicChrome("/portfolio")).toBe(false);
    expect(shouldExcludePublicChrome("/blog")).toBe(false);
    expect(shouldExcludePublicChrome("/blog/future-of-ai")).toBe(false);
  });

  it("should handle null or empty path gracefully", () => {
    expect(shouldExcludePublicChrome(null)).toBe(false);
    expect(shouldExcludePublicChrome(undefined)).toBe(false);
    expect(shouldExcludePublicChrome("")).toBe(false);
  });
});

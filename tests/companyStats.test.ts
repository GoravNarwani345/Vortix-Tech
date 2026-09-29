import { describe, expect, it } from "bun:test";
import { DEFAULT_STATS, getCompanyStats } from "../src/lib/companyStats";

describe("Company Stats Engine", () => {
  it("should have correct default fallback stats", () => {
    expect(DEFAULT_STATS).toBeArray();
    expect(DEFAULT_STATS.length).toBe(4);

    const labels = DEFAULT_STATS.map((s) => s.label);
    expect(labels).toContain("Projects Delivered");
    expect(labels).toContain("Happy Clients");
    expect(labels).toContain("Technologies");
    expect(labels).toContain("Team Members");
  });

  it("should return valid structured stats from getCompanyStats", async () => {
    const stats = await getCompanyStats();
    expect(stats).toBeArray();
    expect(stats.length).toBe(4);

    stats.forEach((item) => {
      expect(typeof item.label).toBe("string");
      expect(typeof item.value).toBe("number");
      expect(item.value).toBeGreaterThan(0);
      expect(typeof item.suffix).toBe("string");
    });

    const projectsStat = stats.find((s) => s.label === "Projects Delivered");
    expect(projectsStat).toBeDefined();
    expect(projectsStat?.suffix).toBe("+");

    const clientsStat = stats.find((s) => s.label === "Happy Clients");
    expect(clientsStat).toBeDefined();
    expect(clientsStat?.suffix).toBe("+");

    const techStat = stats.find((s) => s.label === "Technologies");
    expect(techStat).toBeDefined();
    expect(techStat?.suffix).toBe("+");

    const teamStat = stats.find((s) => s.label === "Team Members");
    expect(teamStat).toBeDefined();
    expect(teamStat?.suffix).toBe("");
  });
});

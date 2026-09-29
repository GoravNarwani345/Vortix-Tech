import prisma from "@/lib/prisma";
import { getStoredSettings } from "@/lib/settings";
import { DEFAULT_STATS, type StatItem } from "@/lib/companyStatsTypes";

export { DEFAULT_STATS, type StatItem };

export async function getCompanyStats(): Promise<StatItem[]> {
  try {
    let dbProjectsCount = 0;
    let dbTestimonialsCount = 0;
    let uniqueTechCount = 0;

    try {
      const [projectsCount, testimonialsCount, projectsWithTags] = await Promise.all([
        prisma.project.count({ where: { isPublished: true } }),
        prisma.testimonial.count({ where: { isPublished: true } }),
        prisma.project.findMany({
          where: { isPublished: true },
          select: { tags: true },
        }),
      ]);

      dbProjectsCount = projectsCount;
      dbTestimonialsCount = testimonialsCount;

      const techSet = new Set<string>();
      // Baseline core technologies
      [
        "nextjs",
        "react",
        "typescript",
        "tailwind",
        "nodejs",
        "python",
        "postgresql",
        "prisma",
        "n8n",
        "comfyui",
        "docker",
        "aws",
        "fastapi",
        "flutter",
        "react-native",
      ].forEach((t) => techSet.add(t));

      projectsWithTags.forEach((p) => {
        if (p.tags) {
          p.tags.split(",").forEach((t) => {
            const clean = t.trim().toLowerCase();
            if (clean) techSet.add(clean);
          });
        }
      });

      uniqueTechCount = techSet.size;
    } catch (dbErr) {
      console.warn("Could not query DB for company stats, using fallbacks:", dbErr);
    }

    const settings = await getStoredSettings();

    const projectsDelivered =
      typeof settings.STATS_PROJECTS_DELIVERED === "number" && settings.STATS_PROJECTS_DELIVERED > 0
        ? settings.STATS_PROJECTS_DELIVERED
        : Math.max(15, dbProjectsCount);

    const happyClients =
      typeof settings.STATS_HAPPY_CLIENTS === "number" && settings.STATS_HAPPY_CLIENTS > 0
        ? settings.STATS_HAPPY_CLIENTS
        : Math.max(8, dbTestimonialsCount);

    const technologies =
      typeof settings.STATS_TECHNOLOGIES === "number" && settings.STATS_TECHNOLOGIES > 0
        ? settings.STATS_TECHNOLOGIES
        : Math.max(15, uniqueTechCount);

    const teamMembers =
      typeof settings.STATS_TEAM_MEMBERS === "number" && settings.STATS_TEAM_MEMBERS > 0
        ? settings.STATS_TEAM_MEMBERS
        : 4;

    return [
      { label: "Projects Delivered", value: projectsDelivered, suffix: "+" },
      { label: "Happy Clients", value: happyClients, suffix: "+" },
      { label: "Technologies", value: technologies, suffix: "+" },
      { label: "Team Members", value: teamMembers, suffix: "" },
    ];
  } catch {
    return DEFAULT_STATS;
  }
}

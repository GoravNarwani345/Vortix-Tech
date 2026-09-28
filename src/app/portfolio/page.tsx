import type { Metadata } from "next";
import PortfolioContent from "./PortfolioContent";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore our portfolio of web apps, mobile apps, AI automations, and custom workflows built for clients worldwide.",
  keywords: ["software portfolio", "Next.js projects", "React Native apps", "AI automation case studies", "Vortix Tech work"],
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: "Portfolio | Vortix Tech",
    description: "Explore our portfolio of web apps, mobile apps, AI automations, and custom workflows built for clients worldwide.",
    url: "https://vortixtech.com/portfolio",
  }
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PortfolioPage() {
  let dbProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];

  try {
    dbProjects = await prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Database may not be available during build/runtime
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Portfolio | Vortix Tech",
    description: "Case studies of web apps, mobile apps, AI automations, and digital platforms built by Vortix Tech.",
    url: "https://vortixtech.com/portfolio",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: dbProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          keywords: project.tags,
          genre: project.category,
          url: project.liveUrl || "https://vortixtech.com/portfolio",
          image: project.images[0] || undefined,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PortfolioContent projects={dbProjects} />
    </>
  );
}

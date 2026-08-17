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
  const dbProjects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return <PortfolioContent projects={dbProjects} />;
}

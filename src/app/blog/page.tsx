import type { Metadata } from "next";
import BlogContent from "./BlogContent";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on web development, AI, automation, and tech trends from the Vortix Tech team.",
  keywords: ["tech blog", "web development insights", "AI automation articles", "software engineering blog"],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Vortix Tech",
    description: "Insights on web development, AI, automation, and tech trends from the Vortix Tech team.",
    url: "https://vortixtech.com/blog",
  }
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Database may not be available during build/runtime
  }

  return <BlogContent posts={articles} />;
}

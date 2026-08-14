import type { Metadata } from "next";
import BlogContent from "./BlogContent";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on web development, AI, automation, and tech trends from the Vortix Tech team.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return <BlogContent posts={articles} />;
}

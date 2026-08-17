import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = "https://vortixtech.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic blog articles
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = articles.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Database may not be available during build
  }

  // Dynamic portfolio projects
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
    });
    projectRoutes = projects.map((project) => ({
      url: `${BASE_URL}/portfolio/${project.id}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Database may not be available during build
  }

  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}

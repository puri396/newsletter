import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://gencontent.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.newsletter.findMany({
    where: {
      contentType: "blog",
      status: "published",
      slug: { not: null },
    },
    select: { slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${APP_URL}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${APP_URL}/subscribe`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${APP_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${APP_URL}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...blogRoutes];
}

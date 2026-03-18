import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.newsletter.findMany({
    where: {
      contentType: "blog",
      status: "published",
      slug: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      subject: true,
      description: true,
      slug: true,
      publishedAt: true,
      bannerImageUrl: true,
      authorName: true,
      tags: true,
    },
    take: 50,
  });

  const lastBuild = posts[0]?.publishedAt ?? new Date();

  const items = posts
    .map((post) => {
      const url = `${APP_URL}/blog/${post.slug ?? post.id}`;
      const pubDate = (post.publishedAt ?? new Date()).toUTCString();
      const description = escapeXml(post.description ?? post.subject);
      const title = escapeXml(post.subject);
      const author = escapeXml(post.authorName ?? "GenContent AI");
      const categories = post.tags
        .map((t) => `      <category>${escapeXml(t)}</category>`)
        .join("\n");

      return `  <item>
    <title>${title}</title>
    <link>${url}</link>
    <description>${description}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${url}</guid>
    <author>${author}</author>
${categories}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GenContent AI Blog</title>
    <link>${APP_URL}/blog</link>
    <description>Insights and updates from GenContent AI.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${APP_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import type { Metadata } from "next";
import { ContentRenderer } from "@/components/content/ContentRenderer";

export const dynamic = "force-dynamic";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://gencontent.ai";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and updates from GenContent AI on content marketing, newsletters, and AI-powered writing.",
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    type: "website",
    title: "Blog | GenContent AI",
    description: "Insights, guides, and updates from GenContent AI on content marketing, newsletters, and AI-powered writing.",
    url: `${APP_URL}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | GenContent AI",
    description: "Insights, guides, and updates from GenContent AI.",
  },
};

async function getPublishedBlogs() {
  return prisma.newsletter.findMany({
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
      logoUrl: true,
      epicMetadata: true,
      body: true,
    },
    take: 50,
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            GenContent AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-200">Home</Link>
            <Link href="/subscribe" className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500">
              Subscribe
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-50">Blog</h1>
          <p className="mt-2 text-slate-400">Insights and updates from GenContent AI.</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-slate-400">No blog posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-600 transition"
              >
                <div className="flex h-full flex-col">
                  <div className="border-b border-slate-800 bg-slate-950">
                    <ContentRenderer
                      contentType="blog"
                      title={post.subject}
                      description={post.description}
                      body={post.body}
                      tags={post.tags}
                      bannerImageUrl={post.bannerImageUrl}
                      logoUrl={post.logoUrl}
                      templateStyle={
                        ((post.epicMetadata as { templateStyle?: string } | null)
                          ?.templateStyle as any) ?? null
                      }
                      mode="thumbnail"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1">
                      {post.tags?.length > 0 && (
                        <div className="mb-1 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-sm font-semibold text-slate-50 group-hover:text-cyan-400 transition line-clamp-2">
                        {post.subject}
                      </h2>
                      {post.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{post.authorName ?? "GenContent AI"}</span>
                      {post.publishedAt && (
                        <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} GenContent AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

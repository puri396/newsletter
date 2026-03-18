import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import type { Metadata } from "next";
import { SocialSharePanel } from "@/components/social/SocialSharePanel";
import { ContentRenderer } from "@/components/content/ContentRenderer";

export const dynamic = "force-dynamic";

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://gencontent.ai";

async function getPost(slug: string) {
  return prisma.newsletter.findFirst({
    where: {
      slug,
      contentType: "blog",
      status: "published",
    },
    select: {
      id: true,
      subject: true,
      description: true,
      body: true,
      slug: true,
      publishedAt: true,
      updatedAt: true,
      bannerImageUrl: true,
      logoUrl: true,
      authorName: true,
      tags: true,
      epicMetadata: true,
    },
  });
}

type SeoMeta = {
  title?: string;
  description?: string;
  keywords?: string[];
  focusKeyword?: string;
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  const seo = ((post.epicMetadata as Record<string, unknown> | null)?.seo ?? {}) as SeoMeta;
  const title = seo.title || post.subject;
  const description = seo.description || post.description || undefined;
  const keywords = seo.keywords?.length
    ? seo.keywords
    : post.tags?.length
      ? post.tags
      : undefined;

  const canonicalUrl = `${APP_URL}/blog/${slug}`;
  const ogImage = post.bannerImageUrl
    ? [{ url: post.bannerImageUrl, width: 1200, height: 630, alt: title }]
    : [];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      images: ogImage,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.authorName ?? "GenContent AI"],
      tags: post.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.bannerImageUrl ? [post.bannerImageUrl] : [],
    },
  };
}

/** Detect if content is HTML (Tiptap) or Markdown */
function isHtml(content: string): boolean {
  return /^<[a-z][\s\S]*>/i.test(content.trimStart());
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const subscribeUrl = `${APP_URL}/subscribe`;

  const seo = ((post.epicMetadata as Record<string, unknown> | null)?.seo ?? {}) as SeoMeta;
  const seoTitle = seo.title || post.subject;
  const seoDescription = seo.description || post.description || "";
  const keywords = seo.keywords?.length ? seo.keywords.join(", ") : post.tags?.join(", ") ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seoTitle,
    description: seoDescription,
    ...(post.bannerImageUrl ? { image: post.bannerImageUrl } : {}),
    datePublished: post.publishedAt?.toISOString() ?? post.updatedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName ?? "GenContent AI",
    },
    publisher: {
      "@type": "Organization",
      name: "GenContent AI",
      url: APP_URL,
    },
    url: `${APP_URL}/blog/${slug}`,
    ...(keywords ? { keywords } : {}),
    ...(post.tags?.length ? { articleSection: post.tags[0] } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${APP_URL}/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            GenContent AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/blog" className="hover:text-slate-200">Blog</Link>
            <Link href={subscribeUrl} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500">
              Subscribe
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
          {post.subject}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex items-center gap-4 text-sm text-slate-400 border-b border-slate-800 pb-6">
          {(post.logoUrl ?? post.bannerImageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.logoUrl ?? post.bannerImageUrl ?? ""}
              alt="Author"
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span>{post.authorName ?? "GenContent AI"}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </time>
            </>
          )}
        </div>

        {/* Description */}
        {post.description && (
          <p className="mb-6 text-lg text-slate-300 leading-relaxed">{post.description}</p>
        )}

        {/* Body rendered via shared content renderer to match editor preview */}
        <div className="mt-6">
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
            mode="full"
          />
        </div>

        {/* Social Share */}
        <div className="mt-10 border-t border-slate-800 pt-6">
          <SocialSharePanel
            title={seoTitle}
            description={seoDescription || undefined}
            url={`${APP_URL}/blog/${slug}`}
            imageUrl={post.bannerImageUrl ?? undefined}
            hashtags={post.tags ?? []}
            compact={true}
          />
        </div>

        {/* Subscribe CTA */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-slate-50">
            Enjoyed this post?
          </h2>
          <p className="mb-4 text-slate-400">
            Subscribe to get our latest articles and newsletters.
          </p>
          <Link
            href={subscribeUrl}
            className="inline-block rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Subscribe for free
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-300">
            ← Back to blog
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} GenContent AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { EpicDashboard } from "@/components/epic/EpicDashboard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface EpicPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function EpicPage({ searchParams }: EpicPageProps) {
  const params = await searchParams;
  let totalCount = 0;
  let publishedCount = 0;
  let content: Awaited<
    ReturnType<
      typeof prisma.newsletter.findMany<{
        where: object;
        orderBy: { createdAt: "desc" };
        take: 100;
        include: { author: { select: { name: true } } };
      }>
    >
  > = [];
  let dbError = false;

  const rawPage = params?.page;
  const parsed = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const currentPage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  try {
    const [total, published, items] = await Promise.all([
      prisma.newsletter.count(),
      prisma.newsletter.count({ where: { status: "published" } }),
      prisma.newsletter.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
        include: { author: { select: { name: true } } },
      }),
    ]);
    totalCount = total;
    publishedCount = published;
    content = items;
  } catch {
    dbError = true;
  }

  const totalPages =
    totalCount === 0 ? 1 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const items = content.map((n) => ({
    id: n.id,
    title: n.shortTitle ?? n.subject,
    authorName: n.authorName ?? n.author?.name ?? null,
    date: n.createdAt.toISOString(),
    status: n.status,
    description: n.description ?? "",
    contentType: n.contentType ?? "newsletter",
    slug: n.slug ?? null,
    bannerImageUrl: n.bannerImageUrl ?? null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
       
        {/* <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/epic/templates"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-zinc-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="7" height="9" rx="1.2" />
              <rect x="11" y="3" width="7" height="4" rx="1.2" />
              <rect x="11" y="10" width="7" height="5" rx="1.2" />
              <rect x="2" y="15" width="16" height="2" rx="1" />
            </svg>
            Browse Blog Templates
          </Link>
          <Link
            href="/epic/templates?type=newsletter"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-zinc-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="7" height="9" rx="1.2" />
              <rect x="11" y="3" width="7" height="4" rx="1.2" />
              <rect x="11" y="10" width="7" height="5" rx="1.2" />
              <rect x="2" y="15" width="16" height="2" rx="1" />
            </svg>
            Browse Newsletter Templates
          </Link>
        </div> */}
      </div>

      {dbError ? (
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load EPIC content. Please try again.
        </div>
      ) : (
        <EpicDashboard
          title="Content Studio (EPIC)"
          description="Create and manage all your newsletters, blogs, images, and videos from a single workspace."
          totalCount={totalCount}
          publishedCount={publishedCount}
          content={items}
          page={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}

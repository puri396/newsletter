import Link from "next/link";
import { prisma } from "@/lib/db";
import type { NewsletterStatus } from "@/prisma-client/enums";
import { NewsletterEditor } from "@/components/newsletter";
import { EmptyState, StatusBadge } from "@/components/ui";

const PAGE_SIZE = 20;

export const revalidate = 60;

interface NewslettersPageProps {
  searchParams?: Promise<{ status?: string; page?: string }>;
}

function resolveStatusFilter(value: string | undefined): NewsletterStatus | undefined {
  if (!value) return undefined;

  const normalized = value.toLowerCase();
  if (normalized === "draft" || normalized === "scheduled" || normalized === "published") {
    return normalized as NewsletterStatus;
  }

  return undefined;
}

function parsePage(value: string | undefined): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function NewslettersPage({ searchParams }: NewslettersPageProps) {
  const params = await searchParams;
  const statusFilter = resolveStatusFilter(params?.status);
  const page = parsePage(params?.page);
  const where = statusFilter ? { status: statusFilter } : undefined;

  let newsletters: Awaited<ReturnType<typeof prisma.newsletter.findMany>> = [];
  let total = 0;
  let dbError = false;
  try {
    const [items, count] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.newsletter.count({ where }),
    ]);
    newsletters = items;
    total = count;
  } catch {
    dbError = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const queryBase = statusFilter ? `status=${encodeURIComponent(statusFilter)}` : "";
  const pageParam = (p: number) => (p === 1 ? "" : `page=${p}`);
  const buildHref = (p: number) => {
    const parts = [queryBase, pageParam(p)].filter(Boolean);
    return parts.length ? `?${parts.join("&")}` : "?";
  };

  return (
    <div className="space-y-6">
      {dbError ? (
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load the newsletter list. Please try again. You can still create and save drafts above.
        </div>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-50">Newsletters</h2>
        <p className="text-sm text-zinc-400">
          Draft, preview, and manage AI-powered newsletters. Use the status filter and table below
          to keep an overview of your newsletters.
        </p>
      </div>

      <NewsletterEditor />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <StatusFilterLink label="All" value={undefined} active={!statusFilter} />
        <StatusFilterLink label="Draft" value="draft" active={statusFilter === "draft"} />
        <StatusFilterLink
          label="Scheduled"
          value="scheduled"
          active={statusFilter === "scheduled"}
        />
        <StatusFilterLink
          label="Published"
          value="published"
          active={statusFilter === "published"}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900/60">
            <tr>
              <th scope="col" className="w-16 px-2 py-2 text-left font-medium text-zinc-400">Banner</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Subject</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Status</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {newsletters.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-0">
                  {dbError ? (
                    <p className="px-4 py-6 text-center text-sm text-zinc-500">
                      Unable to load data. Please try again.
                    </p>
                  ) : (
                    <EmptyState
                      title="No newsletters yet"
                      description="Create your first newsletter to get started."
                      action={{ label: "Create newsletter", href: "/newsletters" }}
                    />
                  )}
                </td>
              </tr>
            ) : (
              newsletters.map((newsletter) => (
                <tr key={newsletter.id} className="hover:bg-zinc-900/40">
                  <td className="px-2 py-3 align-top">
                    {newsletter.bannerImageUrl ? (
                      <img
                        src={newsletter.bannerImageUrl}
                        alt=""
                        className="h-10 w-14 rounded object-cover"
                      />
                    ) : (
                      <span className="inline-block h-10 w-14 rounded bg-zinc-800/80" aria-hidden />
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-100">
                    <Link
                      href={`/newsletters/${newsletter.id}`}
                      className="font-medium text-zinc-100 hover:text-white hover:underline"
                    >
                      {newsletter.subject}
                    </Link>
                    {newsletter.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-400">
                        {newsletter.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={newsletter.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {newsletter.createdAt.toISOString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && !dbError ? (
        <nav
          className="flex flex-wrap items-center gap-2 text-sm text-zinc-400"
          aria-label="Pagination"
        >
          {hasPrev ? (
            <Link
              href={buildHref(page - 1)}
              className="rounded-md border border-zinc-600 px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-600">
              Previous
            </span>
          )}
          <span className="px-2">
            Page {page} of {totalPages}
          </span>
          {hasNext ? (
            <Link
              href={buildHref(page + 1)}
              className="rounded-md border border-zinc-600 px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-600">
              Next
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}

interface StatusFilterLinkProps {
  label: string;
  value: string | undefined;
  active: boolean;
}

function StatusFilterLink({ label, value, active }: StatusFilterLinkProps) {
  const href = value ? `?status=${encodeURIComponent(value)}` : "?";

  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-zinc-100 text-zinc-950"
          : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}      
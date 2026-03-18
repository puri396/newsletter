import Link from "next/link";
import { prisma } from "@/lib/db";
import type { SubscriberStatus } from "@/prisma-client/enums";
import { EmptyState, StatusBadge } from "@/components/ui";
import { SubscriberBulkImport } from "./SubscriberBulkImport";
import { SubscriberSearchForm } from "./SubscriberSearchForm";
import { SubscriberUnsubscribeButton } from "./SubscriberUnsubscribeButton";
import { SubscriberWhatsAppOptInToggle } from "./SubscriberWhatsAppOptInToggle";

const PAGE_SIZE = 20;

export const revalidate = 60;

interface SubscribersPageProps {
  searchParams?: Promise<{
    status?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

function resolveStatusFilter(value: string | undefined): SubscriberStatus | undefined {
  if (!value) return undefined;

  const normalized = value.toLowerCase();
  if (normalized === "active" || normalized === "unsubscribed") {
    return normalized as SubscriberStatus;
  }

  return undefined;
}

function buildSubscribersWhere(
  statusFilter: SubscriberStatus | undefined,
  q: string | undefined,
) {
  const search = q?.trim();
  const statusClause = statusFilter ? { status: statusFilter } : undefined;
  const searchClause =
    search && search.length > 0
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

  if (!statusClause && !searchClause) return undefined;
  if (statusClause && !searchClause) return statusClause;
  if (!statusClause && searchClause) return searchClause;
  return { AND: [statusClause, searchClause] };
}

function parsePage(value: string | undefined): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function SubscribersPage({ searchParams }: SubscribersPageProps) {
  const params = await searchParams;
  const rawStatus = params?.status ?? "active";
  const statusFilter = resolveStatusFilter(rawStatus);
  const q = params?.q?.trim() ?? "";
  const sort = params?.sort === "createdAt_asc" ? "asc" : "desc";
  const page = parsePage(params?.page);
  const where = buildSubscribersWhere(statusFilter, params?.q);

  let subscribers: Awaited<ReturnType<typeof prisma.subscriber.findMany>> = [];
  let total = 0;
  let dbError = false;
  try {
    const [items, count] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: sort },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.subscriber.count({ where }),
    ]);
    subscribers = items;
    total = count;
  } catch {
    dbError = true;
  }

  const hasSearch = q.length > 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const queryParams = new URLSearchParams();
  if (params?.q?.trim()) queryParams.set("q", params.q.trim());
  if (statusFilter) queryParams.set("status", statusFilter);
  if (params?.sort) queryParams.set("sort", params.sort);
  const buildHref = (p: number) => {
    const next = new URLSearchParams(queryParams);
    if (p > 1) next.set("page", String(p));
    const s = next.toString();
    return s ? `/subscribers?${s}` : "/subscribers";
  };

  return (
    <div className="space-y-4">
      {dbError ? (
        <div
          className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200"
          role="alert"
        >
          Unable to load subscribers. Please try again.
        </div>
      ) : null}
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Subscribers</h2>
        <p className="text-sm text-zinc-400">
          View and manage newsletter subscribers. Search by email or name, filter by status.
        </p>
      </div>

      <SubscriberSearchForm
        currentQ={q}
        currentStatus={statusFilter}
        currentSort={sort === "asc" ? "createdAt_asc" : "createdAt_desc"}
      />

      <SubscriberBulkImport />

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900/60">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Name</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Email</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Phone</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">WhatsApp</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Status</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Created</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Unsubscribed at</th>
              <th scope="col" className="px-4 py-2 text-left font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  {dbError ? (
                    <p className="px-4 py-6 text-center text-sm text-zinc-500">
                      Unable to load data. Please try again.
                    </p>
                  ) : (
                    <EmptyState
                      title={hasSearch ? "No subscribers match your search" : "No subscribers yet"}
                      description={
                        hasSearch
                          ? "Try a different search or filter."
                          : "Add subscribers via bulk import or the public signup form."
                      }
                      action={
                        hasSearch
                          ? undefined
                          : { label: "Import subscribers", href: "/subscribers" }
                      }
                    />
                  )}
                </td>
              </tr>
            ) : (
              subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-zinc-900/40">
                  <td className="px-4 py-3 align-top text-zinc-300">
                    {subscriber.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-100">{subscriber.email}</td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {subscriber.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {subscriber.whatsappOptIn ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={subscriber.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {subscriber.createdAt.toISOString()}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-400">
                    {subscriber.unsubscribedAt
                      ? subscriber.unsubscribedAt.toISOString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <SubscriberRowActions
                      subscriberId={subscriber.id}
                      status={subscriber.status}
                      whatsappOptIn={subscriber.whatsappOptIn}
                    />
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

function SubscriberRowActions({
  subscriberId,
  status,
  whatsappOptIn,
}: {
  subscriberId: string;
  status: string;
  whatsappOptIn: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SubscriberUnsubscribeButton
        subscriberId={subscriberId}
        status={status}
      />
      <SubscriberWhatsAppOptInToggle
        subscriberId={subscriberId}
        whatsappOptIn={whatsappOptIn}
      />
    </div>
  );
}




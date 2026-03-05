import type { SubscriberStatus } from "@/prisma-client/enums";

interface SubscriberSearchFormProps {
  currentQ: string;
  currentStatus: SubscriberStatus | undefined;
  currentSort: "createdAt_asc" | "createdAt_desc";
}

function buildQueryString(params: {
  q?: string;
  status?: string;
  sort?: string;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.sort) search.set("sort", params.sort);
  const s = search.toString();
  return s ? `?${s}` : "?";
}

export function SubscriberSearchForm({
  currentQ,
  currentStatus,
  currentSort,
}: SubscriberSearchFormProps) {
  const baseParams = {
    q: currentQ || undefined,
    status: currentStatus,
    sort: undefined as string | undefined,
  };

  return (
    <div className="space-y-3">
      <form
        method="get"
        action="/subscribers"
        className="flex flex-wrap items-center gap-2"
      >
        {currentStatus && (
          <input type="hidden" name="status" value={currentStatus} />
        )}
        {currentSort !== "createdAt_desc" && (
          <input type="hidden" name="sort" value={currentSort} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={currentQ}
          placeholder="Search by email or name"
          className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 min-w-[200px]"
          aria-label="Search subscribers"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-zinc-500">Status:</span>
        <a
          href={buildQueryString({ ...baseParams, status: undefined })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !currentStatus
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          All
        </a>
        <a
          href={buildQueryString({ ...baseParams, status: "active" })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentStatus === "active"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          Active
        </a>
        <a
          href={buildQueryString({ ...baseParams, status: "unsubscribed" })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentStatus === "unsubscribed"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          Unsubscribed
        </a>

        <span className="ml-4 text-zinc-500">Sort:</span>
        <a
          href={buildQueryString({ ...baseParams, sort: "createdAt_desc" })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentSort === "createdAt_desc"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          Newest first
        </a>
        <a
          href={buildQueryString({ ...baseParams, sort: "createdAt_asc" })}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentSort === "createdAt_asc"
              ? "bg-zinc-100 text-zinc-950"
              : "bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          }`}
        >
          Oldest first
        </a>
      </div>
    </div>
  );
}

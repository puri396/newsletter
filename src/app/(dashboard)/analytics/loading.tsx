import { LoadingSkeletonCards, LoadingSkeletonTable } from "@/components/ui";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded bg-zinc-800" />
      </div>
      <LoadingSkeletonTable rows={5} cols={8} />
      <div>
        <div className="mb-2 h-5 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mb-3 h-4 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 animate-pulse rounded-lg border border-zinc-800 bg-zinc-950/40" />
          <div className="h-40 animate-pulse rounded-lg border border-zinc-800 bg-zinc-950/40" />
          <div className="h-40 animate-pulse rounded-lg border border-zinc-800 bg-zinc-950/40" />
        </div>
      </div>
    </div>
  );
}

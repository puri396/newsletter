import { LoadingSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-1 h-4 w-72 animate-pulse rounded bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
        <LoadingSkeleton className="h-24" />
      </div>

      <div>
        <div className="mb-2 h-5 w-28 animate-pulse rounded bg-zinc-800" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} className="h-11 w-40" />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 h-5 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <div className="h-10 bg-zinc-900/60" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 border-t border-zinc-800 animate-pulse bg-zinc-950/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

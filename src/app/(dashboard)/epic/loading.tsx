import { LoadingSkeletonCards, LoadingSkeletonTable } from "@/components/ui";

export default function EpicLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
      <LoadingSkeletonCards count={2} />
      <LoadingSkeletonTable rows={6} cols={6} />
    </div>
  );
}


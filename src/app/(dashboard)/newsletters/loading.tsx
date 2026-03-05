import { LoadingSkeletonTable } from "@/components/ui";

export default function NewslettersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-1 h-4 w-96 max-w-full animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
      </div>
      <LoadingSkeletonTable rows={6} cols={3} />
    </div>
  );
}

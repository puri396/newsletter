interface LoadingSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

function Skeleton({ className = "", style }: LoadingSkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-800 ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function LoadingSkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-24"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}

export function LoadingSkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <div className="h-10 bg-zinc-900/60" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex border-t border-zinc-800 bg-zinc-950/40 px-4 py-3 gap-4"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <Skeleton className={className} />;
}

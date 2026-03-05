export default function SubscribersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="h-4 w-96 animate-pulse rounded bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-zinc-800" />
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <div className="h-10 bg-zinc-900/60" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 border-t border-zinc-800 animate-pulse bg-zinc-950/40"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

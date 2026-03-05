export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-zinc-100">Dashboard</h1>
        <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
          DEV
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          className="hidden rounded-full border border-zinc-700 px-3 py-1 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900 sm:inline-flex"
        >
          Logout
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-100">
          U
        </div>
      </div>
    </header>
  );
}


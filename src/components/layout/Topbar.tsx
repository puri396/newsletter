"use client";

import { signOut, useSession } from "next-auth/react";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur lg:px-8">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-sm font-medium text-zinc-100 hidden sm:block">Dashboard</h1>
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hidden rounded-full border border-zinc-700 px-3 py-1 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900 sm:inline-flex"
        >
          Logout
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-100"
          title={session?.user?.email ?? ""}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

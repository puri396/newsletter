"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/newsletters", label: "Newsletters" },
  { href: "/subscribers", label: "Subscribers" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/80 px-4 py-6 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-900">
          ON
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">Orion Newsletter</span>
          <span className="text-xs text-zinc-400">AI Content Studio</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
        <p>v0.1 · Internal admin</p>
      </div>
    </aside>
  );
}


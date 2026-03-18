import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastProvider } from "@/components/ui";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-50">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col bg-zinc-950">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-6 pb-10 pt-4 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}


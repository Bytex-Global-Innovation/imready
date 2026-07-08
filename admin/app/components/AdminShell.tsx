"use client";

import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

interface AdminShellProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onSidebarClose: () => void;
  searchPlaceholder?: string;
}

export default function AdminShell({
  children,
  sidebarOpen,
  onMenuToggle,
  onSidebarClose,
  searchPlaceholder,
}: AdminShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Topbar
        searchPlaceholder={searchPlaceholder}
        onMenuToggle={onMenuToggle}
        menuOpen={sidebarOpen}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} onClose={onSidebarClose} />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

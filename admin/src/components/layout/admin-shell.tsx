"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

interface AdminShellProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onSidebarClose: () => void;
}

export default function AdminShell({
  children,
  sidebarOpen,
  onMenuToggle,
  onSidebarClose,
}: AdminShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Topbar onMenuToggle={onMenuToggle} menuOpen={sidebarOpen} />

      <div className="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} onClose={onSidebarClose} />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

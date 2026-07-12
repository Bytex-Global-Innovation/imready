"use client";

import AdminShell from "@/components/layout/admin-shell";
import { useSidebar } from "@/hooks/use-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      onMenuToggle={toggleSidebar}
      onSidebarClose={closeSidebar}
      searchPlaceholder="Search students, projects..."
    >
      {children}
    </AdminShell>
  );
}

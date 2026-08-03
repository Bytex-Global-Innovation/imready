"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/admin-shell";
import { useSidebar } from "@/hooks/use-sidebar";
import { isAdminAuthenticated } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Checking session…
      </div>
    );
  }

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      onMenuToggle={toggleSidebar}
      onSidebarClose={closeSidebar}
    >
      {children}
    </AdminShell>
  );
}

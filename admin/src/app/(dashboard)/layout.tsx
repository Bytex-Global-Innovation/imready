"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/layout/admin-shell";
import { useSidebar } from "@/hooks/use-sidebar";
import { authApi } from "@/lib/api";
import {
  clearAdminSession,
  setAdminSessionExpiresAt,
} from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let logoutTimer: ReturnType<typeof setTimeout> | null = null;

    async function forceLogout() {
      clearAdminSession();
      try {
        await authApi.logout();
      } catch {
        // ignore
      }
      if (!cancelled) router.replace("/");
    }

    async function bootstrap() {
      try {
        const data = await authApi.me();
        if (cancelled) return;

        setAdminSessionExpiresAt(data.expiresAt);
        const msLeft = new Date(data.expiresAt).getTime() - Date.now();
        if (msLeft <= 0) {
          await forceLogout();
          return;
        }

        logoutTimer = setTimeout(() => {
          void forceLogout();
        }, msLeft);

        setReady(true);
      } catch {
        if (!cancelled) {
          clearAdminSession();
          router.replace("/");
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      if (logoutTimer) clearTimeout(logoutTimer);
    };
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

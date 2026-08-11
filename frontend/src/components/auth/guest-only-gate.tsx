"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, isGuestOnlyAuthRoute } from "@/constants/routes";
import {
  getCachedStudentSession,
  loadStudentSession,
} from "@/lib/student-session";

function SessionLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
      Checking your session…
    </div>
  );
}

/**
 * Blocks login/signup for authenticated students (redirects to dashboard).
 * Other auth pages (forgot/reset/verify) stay reachable.
 */
export function GuestOnlyGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const shouldGuard = isGuestOnlyAuthRoute(pathname);
  const [allowed, setAllowed] = useState(() => !shouldGuard);

  useEffect(() => {
    if (!shouldGuard) {
      setAllowed(true);
      return;
    }

    let cancelled = false;
    setAllowed(false);

    async function ensureGuest() {
      if (getCachedStudentSession()) {
        router.replace(ROUTES.dashboard);
        return;
      }

      try {
        await loadStudentSession();
        if (!cancelled) {
          router.replace(ROUTES.dashboard);
        }
      } catch {
        if (!cancelled) {
          setAllowed(true);
        }
      }
    }

    ensureGuest();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, shouldGuard]);

  if (shouldGuard && !allowed) {
    return <SessionLoading />;
  }

  return <>{children}</>;
}

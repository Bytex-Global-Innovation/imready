"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "@/components/icons";
import { NAV_LINKS, SITE_CONFIG } from "@/constants/site";
import { ROUTES, isAppRoute, isAuthRoute } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import {
  clearStudentSessionCache,
  getCachedStudentSession,
  loadStudentSession,
} from "@/lib/student-session";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link
      href={ROUTES.home}
      className="flex min-w-0 cursor-pointer items-center"
    >
      <Image
        src="/imready_logo.jpeg"
        alt={`${SITE_CONFIG.name} logo`}
        width={120}
        height={40}
        className="h-8 w-auto shrink-0 object-contain sm:h-9"
        priority
      />
    </Link>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function UserMenu({
  name,
  onLogout,
}: {
  name: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#153a75] text-xs font-semibold tracking-wide text-white ring-offset-2 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153a75]"
      >
        {getInitials(name)}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[110] mt-2 min-w-[160px] overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          <p className="truncate border-b border-border px-3 py-2 text-xs font-medium text-muted">
            {name}
          </p>
          <Link
            href={ROUTES.dashboard}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-surface"
          >
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const cached = getCachedStudentSession();
      if (cached?.student?.studentName) {
        if (!cancelled) {
          setStudentName(cached.student.studentName);
          setAuthChecked(true);
        }
        return;
      }

      try {
        const session = await loadStudentSession();
        if (cancelled) return;
        setStudentName(session.student.studentName || "Student");
      } catch {
        if (!cancelled) {
          clearStudentSessionCache();
          setStudentName(null);
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    if (!isAppRoute(pathname) && !isAuthRoute(pathname)) {
      checkSession();
    }

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await authApi.logout();
    setStudentName(null);
    setMobileOpen(false);
    router.refresh();
  }

  if (isAppRoute(pathname) || isAuthRoute(pathname)) {
    return null;
  }

  const isLoggedIn = authChecked && Boolean(studentName);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] bg-hero px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <nav
          className="relative z-[100] mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-border bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-2.5"
          aria-label="Main navigation"
        >
          <Logo />

          <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex lg:gap-4">
            {isLoggedIn && studentName ? (
              <UserMenu name={studentName} onLogout={handleLogout} />
            ) : (
              <>
                <Button variant="ghost" size="sm" href={ROUTES.login}>
                  Log In
                </Button>
                <Button size="sm" href={ROUTES.signup}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {isLoggedIn && studentName ? (
              <UserMenu name={studentName} onLogout={handleLogout} />
            ) : null}
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          className={cn(
            "mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm backdrop-blur-sm lg:hidden",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <ul className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
              <Button variant="secondary" href={ROUTES.login} className="w-full">
                Log In
              </Button>
              <Button href={ROUTES.signup} className="w-full">
                Get Started
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
              <Link
                href={ROUTES.dashboard}
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[var(--radius-button)] border border-border bg-white text-sm font-medium text-foreground hover:bg-surface"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border bg-white text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div
        className="h-[5.5rem] shrink-0 bg-hero sm:h-[5.75rem]"
        aria-hidden="true"
      />
    </>
  );
}

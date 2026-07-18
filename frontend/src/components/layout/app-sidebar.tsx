"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DASHBOARD_USER } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

const PROJECTS_LOCKED_MESSAGE =
  "To unlock the benefits, please clear the test or buy an exclusive premium plan.";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
    locked: false,
    match: (pathname: string) =>
      pathname === ROUTES.dashboard ||
      pathname.startsWith(ROUTES.assessment),
  },
  {
    label: "Projects",
    href: ROUTES.projects,
    icon: FolderKanban,
    locked: true,
    match: (pathname: string) =>
      pathname === ROUTES.projects || pathname.startsWith(`${ROUTES.projects}/`),
  },
  {
    label: "Notifications",
    href: "#",
    icon: Bell,
    locked: false,
    match: () => false,
  },
] as const;

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);
  const projectsItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProjectsTooltip) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (projectsItemRef.current && !projectsItemRef.current.contains(target)) {
        setShowProjectsTooltip(false);
      }
    }

    const timeoutId = window.setTimeout(() => {
      setShowProjectsTooltip(false);
    }, 4000);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showProjectsTooltip]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 lg:pt-6">
          <Link
            href={ROUTES.dashboard}
            className="font-display text-xl font-bold tracking-tight text-primary"
            onClick={onClose}
          >
            {SITE_CONFIG.name}
          </Link>
          <button
            type="button"
            className="inline-flex cursor-pointer rounded-md p-1.5 text-muted hover:bg-white hover:text-foreground lg:hidden"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 px-4">
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white p-3 shadow-sm">
            <Image
              src={DASHBOARD_USER.avatarSrc}
              alt={DASHBOARD_USER.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {DASHBOARD_USER.name}
              </p>
              <p className="truncate text-xs text-muted">{DASHBOARD_USER.role}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-4" aria-label="App navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);

            if (item.locked) {
              return (
                <div key={item.label} ref={projectsItemRef} className="relative">
                  <button
                    type="button"
                    aria-describedby={
                      showProjectsTooltip ? "projects-locked-tooltip" : undefined
                    }
                    onClick={() => setShowProjectsTooltip((open) => !open)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <Lock
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        active ? "text-white/80" : "text-muted",
                      )}
                      aria-hidden
                    />
                  </button>

                  {showProjectsTooltip ? (
                    <div
                      id="projects-locked-tooltip"
                      role="tooltip"
                      className="absolute bottom-full left-0 z-[60] mb-1.5 w-[min(240px,calc(100vw-2rem))] rounded-md border border-red-200 bg-white px-3 py-2 text-xs leading-relaxed text-red-600 shadow-md"
                    >
                      <span
                        className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-r border-b border-red-200 bg-white"
                        aria-hidden
                      />
                      {PROJECTS_LOCKED_MESSAGE}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 px-4 pb-6">
          <Button className="w-full" size="sm">
            Upgrade Plan
          </Button>
          <Link
            href={ROUTES.faq}
            onClick={onClose}
            className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            Help Center
          </Link>
          <Link
            href={ROUTES.login}
            onClick={onClose}
            className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-bold text-primary">
            {SITE_CONFIG.name}
          </span>
        </header>
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  X,
} from "@/components/icons";
import { DASHBOARD_USER } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { PAID_PROJECTS_LOCKED_MESSAGE } from "@/constants/project-access";
import { SITE_CONFIG } from "@/constants/site";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const HELP_CENTER_EMAIL = "imready.in";
const SIDEBAR_COLLAPSED_KEY = "imready.sidebar.collapsed";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function UserAvatar({ name, compact }: { name: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[#153a75] font-semibold tracking-wide text-white",
        compact ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm",
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

function getNavItems(paidProjectsUnlocked: boolean) {
  return [
    {
      label: "Dashboard",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
      locked: false,
      match: (pathname: string) => pathname === ROUTES.dashboard,
    },
    {
      label: "Unpaid Projects",
      href: ROUTES.freeProjects,
      icon: Gift,
      locked: false,
      match: (pathname: string) =>
        pathname === ROUTES.freeProjects ||
        pathname.startsWith(`${ROUTES.freeProjects}/`) ||
        pathname.startsWith("/stage-2/projects/"),
    },
    {
      label: " Paid Industry Projects",
      href: ROUTES.projects,
      icon: FolderKanban,
      locked: !paidProjectsUnlocked,
      lockedMessage: PAID_PROJECTS_LOCKED_MESSAGE,
      match: (pathname: string) =>
        pathname === ROUTES.projects || pathname.startsWith(`${ROUTES.projects}/`),
    },
    {
      label: "Notifications",
      href: ROUTES.notifications,
      icon: Bell,
      locked: false,
      match: (pathname: string) =>
        pathname === ROUTES.notifications ||
        pathname.startsWith(`${ROUTES.notifications}/`),
    },
  ] as const;
}

type TooltipCoords = { top: number; left: number };

/** Shared behavior for a click-to-open, auto-dismissing sidebar tooltip. */
function useAutoDismissTooltip(timeoutMs = 4000) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  function updateCoords(preferRight: boolean) {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (preferRight) {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
      return;
    }
    setCoords({
      top: rect.top - 8,
      left: rect.left,
    });
  }

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (anchorRef.current && !anchorRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    function handleReposition() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Keep right-side placement once opened while collapsed/narrow.
      if (coords && coords.left >= rect.right) {
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
        });
      } else {
        setCoords({
          top: rect.top - 8,
          left: rect.left,
        });
      }
    }

    const timeoutId = window.setTimeout(() => {
      setIsOpen(false);
    }, timeoutMs);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, timeoutMs, coords]);

  return {
    isOpen,
    coords,
    toggle: (preferRight?: boolean) => {
      const placeRight = preferRight === true;
      setIsOpen((open) => {
        const next = !open;
        if (next) {
          requestAnimationFrame(() => updateCoords(placeRight));
        } else {
          setCoords(null);
        }
        return next;
      });
    },
    anchorRef,
  } as const;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AppSidebar({
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapsed,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const projectsTooltip = useAutoDismissTooltip();
  const helpTooltip = useAutoDismissTooltip();
  const { student, paidProjectsUnlocked } = useStudentProfile();
  const navItems = getNavItems(paidProjectsUnlocked);
  const displayName = student?.studentName || DASHBOARD_USER.name;
  const displayRole = student?.level || DASHBOARD_USER.role;

  async function handleSignOut() {
    await authApi.logout();
    onClose();
    router.replace(ROUTES.login);
  }

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
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-border bg-surface transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-[272px]",
          "w-[272px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 pt-5 lg:pt-6",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!collapsed ? (
            <Link
              href={ROUTES.dashboard}
              prefetch={false}
              className="font-display text-xl font-bold tracking-tight text-primary"
              onClick={onClose}
            >
              {SITE_CONFIG.name}
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex cursor-pointer rounded-md p-1.5 text-muted hover:bg-white hover:text-foreground lg:hidden"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden cursor-pointer rounded-md p-1.5 text-muted hover:bg-white hover:text-foreground lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className={cn("mt-5 shrink-0", collapsed ? "px-2" : "px-4")}>
          <div
            className={cn(
              "flex items-center rounded-[var(--radius-card)] border border-border bg-white shadow-sm",
              collapsed ? "justify-center p-2" : "gap-3 p-3",
            )}
            title={collapsed ? `${displayName} · ${displayRole}` : undefined}
          >
            <UserAvatar name={displayName} compact={collapsed} />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted">{displayRole}</p>
              </div>
            ) : null}
          </div>
        </div>

        <nav
          className={cn(
            "mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto",
            collapsed ? "px-2" : "px-4",
          )}
          aria-label="App navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);

            if (item.locked) {
              return (
                <div key={item.label} ref={projectsTooltip.anchorRef} className="relative">
                  <button
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    aria-describedby={
                      projectsTooltip.isOpen ? "projects-locked-tooltip" : undefined
                    }
                    onClick={() => projectsTooltip.toggle(collapsed)}
                    className={cn(
                      "flex w-full cursor-pointer items-center rounded-[var(--radius-button)] text-left text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                      active ? "bg-primary text-white" : "text-foreground hover:bg-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span className="flex-1">{item.label}</span> : null}
                    {!collapsed ? (
                      <Lock
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          active ? "text-white/80" : "text-muted",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </button>

                  {projectsTooltip.isOpen && projectsTooltip.coords ? (
                    <div
                      id="projects-locked-tooltip"
                      role="tooltip"
                      className="fixed z-[80] w-[min(260px,calc(100vw-1.5rem))] rounded-md border border-red-200 bg-white px-3 py-2 text-xs leading-relaxed text-red-600 shadow-lg"
                      style={
                        collapsed
                          ? {
                              top: projectsTooltip.coords.top,
                              left: projectsTooltip.coords.left,
                              transform: "translateY(-50%)",
                            }
                          : {
                              top: projectsTooltip.coords.top,
                              left: projectsTooltip.coords.left,
                              transform: "translateY(-100%)",
                            }
                      }
                    >
                      <span
                        className={cn(
                          "absolute h-3 w-3 rotate-45 border-red-200 bg-white",
                          collapsed
                            ? "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
                            : "-bottom-1.5 left-6 border-r border-b",
                        )}
                        aria-hidden
                      />
                      {"lockedMessage" in item && item.lockedMessage
                        ? item.lockedMessage
                        : PAID_PROJECTS_LOCKED_MESSAGE}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                title={item.label}
                aria-label={item.label}
                onClick={onClose}
                className={cn(
                  "flex cursor-pointer items-center rounded-[var(--radius-button)] text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                  active ? "bg-primary text-white" : "text-foreground hover:bg-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? <span className="flex-1">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-auto shrink-0 space-y-1 border-t border-border pt-3 pb-5",
            collapsed ? "px-2" : "px-4",
          )}
        >
          <div ref={helpTooltip.anchorRef} className="relative">
            <button
              type="button"
              title="Help Center"
              aria-label="Help Center"
              aria-describedby={helpTooltip.isOpen ? "help-center-tooltip" : undefined}
              onClick={helpTooltip.toggle}
              className={cn(
                "flex w-full cursor-pointer items-center rounded-[var(--radius-button)] text-left text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
              )}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>Help Center</span> : null}
            </button>

            {helpTooltip.isOpen ? (
              <div
                id="help-center-tooltip"
                role="tooltip"
                className="absolute bottom-full left-0 z-[60] mb-1.5 w-[min(240px,calc(100vw-2rem))] rounded-md border border-brand-100 bg-white px-3 py-2.5 text-xs leading-relaxed text-foreground shadow-md"
              >
                <span
                  className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-r border-b border-brand-100 bg-white"
                  aria-hidden
                />
                <p>Have a question? Reach out and we&apos;ll get back to you.</p>
                <a
                  href={`mailto:${HELP_CENTER_EMAIL}`}
                  className="mt-1.5 flex cursor-pointer items-center gap-1.5 font-semibold text-primary hover:text-primary-hover"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {HELP_CENTER_EMAIL}
                </a>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            title="Sign Out"
            aria-label="Sign Out"
            onClick={handleSignOut}
            className={cn(
              "flex w-full cursor-pointer items-center rounded-[var(--radius-button)] text-left text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground",
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Sign Out</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

function useStage2Surface() {
  const pathname = usePathname();
  return (
    pathname.startsWith("/stage-2") ||
    pathname === ROUTES.freeProjects ||
    pathname.startsWith(`${ROUTES.freeProjects}/`) ||
    pathname === ROUTES.foundationComplete ||
    pathname.startsWith("/assessment/complete")
  );
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const stage2Surface = useStage2Surface();

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        "flex h-dvh overflow-hidden",
        stage2Surface ? "bg-[#f8f9ff]" : "bg-background",
      )}
    >
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          stage2Surface ? "bg-[#f8f9ff]" : "bg-background",
        )}
      >
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
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
        <main
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
            stage2Surface && "bg-[#f8f9ff]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
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
import { Button } from "@/components/ui/button";
import { DASHBOARD_USER } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { authApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  UpgradePlanModal,
  UPGRADE_TOOLTIP_BENEFITS,
} from "@/features/dashboard/components/upgrade-plan-modal";

const PROJECTS_LOCKED_MESSAGE =
  "Projects unlock after you complete all 5 Foundation missions, or after premium access is approved.";

const HELP_CENTER_EMAIL = "support@imready.io";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-sm font-semibold tracking-wide text-white"
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

function getNavItems(projectsUnlocked: boolean) {
  return [
    {
      label: "Dashboard",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
      locked: false,
      match: (pathname: string) =>
        pathname === ROUTES.dashboard,
    },
    {
      label: "Free Projects",
      href: ROUTES.freeProjects,
      icon: Gift,
      locked: false,
      match: (pathname: string) =>
        pathname === ROUTES.freeProjects || pathname.startsWith(`${ROUTES.freeProjects}/`),
    },
    {
      label: " Paid Industry Projects",
      href: ROUTES.projects,
      icon: FolderKanban,
      locked: !projectsUnlocked,
      match: (pathname: string) =>
        pathname === ROUTES.projects || pathname.startsWith(`${ROUTES.projects}/`),
    },
  ] as const;
}

/** Shared behavior for a click-to-open, auto-dismissing sidebar tooltip. */
function useAutoDismissTooltip(timeoutMs = 4000) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (anchorRef.current && !anchorRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    const timeoutId = window.setTimeout(() => {
      setIsOpen(false);
    }, timeoutMs);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, timeoutMs]);

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    anchorRef,
  } as const;
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const projectsTooltip = useAutoDismissTooltip();
  const helpTooltip = useAutoDismissTooltip();
  const { student, projectsUnlocked, refresh } = useStudentProfile();
  const navItems = getNavItems(projectsUnlocked);
  const displayName = student?.studentName || DASHBOARD_USER.name;
  const displayRole = student?.level || DASHBOARD_USER.role;
  const subscriptionStatus = student?.subscriptionStatus || "FREE";
  const [upgradeTooltipOpen, setUpgradeTooltipOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

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
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 lg:pt-6">
          <Link
            href={ROUTES.dashboard}
            prefetch={false}
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
            <UserAvatar name={displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted">{displayRole}</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-4" aria-label="App navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);

            if (item.locked) {
              return (
                <div key={item.label} ref={projectsTooltip.anchorRef} className="relative">
                  <button
                    type="button"
                    aria-describedby={
                      projectsTooltip.isOpen ? "projects-locked-tooltip" : undefined
                    }
                    onClick={projectsTooltip.toggle}
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

                  {projectsTooltip.isOpen ? (
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
                prefetch={false}
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
          <div
            className="relative"
            onMouseEnter={() => setUpgradeTooltipOpen(true)}
            onMouseLeave={() => setUpgradeTooltipOpen(false)}
          >
            <Button
              type="button"
              className="w-full"
              size="sm"
              onClick={() => {
                setUpgradeTooltipOpen(false);
                if (subscriptionStatus === "PREMIUM_PENDING") {
                  router.push(ROUTES.details);
                  return;
                }
                setUpgradeModalOpen(true);
              }}
            >
              {subscriptionStatus === "PREMIUM"
                ? "Premium Active"
                : subscriptionStatus === "PREMIUM_PENDING"
                  ? "Complete Payment"
                  : "Upgrade Plan"}
            </Button>

            {upgradeTooltipOpen ? (
              <div
                role="tooltip"
                className="absolute bottom-full left-0 z-[60] mb-2 w-[min(260px,calc(100vw-2rem))] rounded-md border border-brand-100 bg-white px-3 py-2.5 text-left shadow-md"
              >
                <span
                  className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 border-r border-b border-brand-100 bg-white"
                  aria-hidden
                />
                <p className="text-xs font-semibold text-foreground">
                  Why upgrade?
                </p>
                <ul className="mt-1.5 space-y-1">
                  {UPGRADE_TOOLTIP_BENEFITS.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex gap-1.5 text-xs leading-relaxed text-muted"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div ref={helpTooltip.anchorRef} className="relative">
            <button
              type="button"
              aria-describedby={helpTooltip.isOpen ? "help-center-tooltip" : undefined}
              onClick={helpTooltip.toggle}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
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
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-button)] px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-white hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <UpgradePlanModal
        isOpen={upgradeModalOpen}
        subscriptionStatus={subscriptionStatus}
        onClose={() => setUpgradeModalOpen(false)}
        onRequested={refresh}
      />
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
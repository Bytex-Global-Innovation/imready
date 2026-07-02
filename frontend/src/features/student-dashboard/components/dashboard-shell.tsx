"use client";

import { useState } from "react";
import Link from "next/link";
import { Code, Menu, X } from "lucide-react";
import {
  DASHBOARD_COPY,
  MOCK_STUDENT,
} from "@/constants/student-dashboard";
import { SITE_CONFIG } from "@/constants";
import type { DashboardNavId } from "@/constants/student-dashboard";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "./dashboard-sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  activeNav?: DashboardNavId;
  hideMobileBar?: boolean;
}

export function DashboardShell({
  children,
  activeNav = "projects",
  hideMobileBar = false,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn("flex bg-surface", hideMobileBar ? "min-h-0 flex-1" : "min-h-screen")}>
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-white">
        <DashboardSidebar activeNav={activeNav} />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label={DASHBOARD_COPY.closeMenu}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-lg font-bold text-brand-700">
                {SITE_CONFIG.name}
              </span>
              <button
                type="button"
                className="rounded-md p-2 text-muted hover:bg-surface"
                aria-label={DASHBOARD_COPY.closeMenu}
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <DashboardSidebar
              activeNav={activeNav}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {!hideMobileBar ? (
          <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-muted hover:bg-surface"
              aria-label={DASHBOARD_COPY.openMenu}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-lg font-bold text-brand-700">
              {SITE_CONFIG.name}
            </span>
            <DashboardUserChip compact />
          </header>
        ) : (
          <div className="flex items-center border-b border-border bg-white px-4 py-2 lg:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-muted hover:bg-surface"
              aria-label={DASHBOARD_COPY.openMenu}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="ml-2 text-sm font-medium text-muted">Menu</span>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function DashboardUserChip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      {!compact ? (
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-foreground">{MOCK_STUDENT.name}</p>
          <p className="text-xs text-muted">{MOCK_STUDENT.subtitle}</p>
        </div>
      ) : null}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
          compact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm",
        )}
        aria-hidden="true"
      >
        {MOCK_STUDENT.avatarInitials}
      </div>
    </div>
  );
}

export function DashboardPageHeader({
  title,
  subtitle,
  showCategoryBadge = true,
  showUserChip = true,
  actions,
}: {
  title: string;
  subtitle?: string;
  showCategoryBadge?: boolean;
  showUserChip?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold text-hero-heading sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        {showCategoryBadge ? (
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-badge)] border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground">
            <Code className="h-4 w-4 text-brand-600" />
            {MOCK_STUDENT.category}
          </span>
        ) : null}
        {showUserChip ? (
          <div className="hidden lg:flex">
            <DashboardUserChip />
          </div>
        ) : null}
        {actions}
      </div>
    </div>
  );
}

export function DashboardBreadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4 text-sm text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

"use client";

import Link from "next/link";
import {
  DASHBOARD_COPY,
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_SETTINGS_NAV,
  type DashboardNavId,
} from "@/constants/student-dashboard";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  activeNav: DashboardNavId;
  onNavigate?: () => void;
}

const IMPLEMENTED_NAV: DashboardNavId[] = ["projects"];

export function DashboardSidebar({ activeNav, onNavigate }: DashboardSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-3 lg:px-4 lg:py-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          {DASHBOARD_COPY.sidebarHeading}
        </p>
        <nav aria-label="Dashboard navigation">
          <ul className="space-y-1">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const isActive = item.id === activeNav;
              const isImplemented = IMPLEMENTED_NAV.includes(item.id);
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  {isImplemented ? (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-muted hover:bg-surface hover:text-foreground",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className={cn("h-5 w-5", isActive && "text-brand-600")} />
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted/60"
                      title="Coming soon"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-auto border-t border-border px-3 py-4 lg:px-4">
        <span
          className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted/60"
          title="Coming soon"
        >
          <DASHBOARD_SETTINGS_NAV.icon className="h-5 w-5" />
          {DASHBOARD_SETTINGS_NAV.label}
        </span>
      </div>
    </div>
  );
}

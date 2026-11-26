"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  FolderKanban,
  Users,
  type LucideIcon,
} from "@/components/icons";
import ApplicationsTable from "@/components/tables/applications-table";
import { dashboardApi, type DashboardSummary } from "@/lib/api";

type MetricKey = "studentsCount" | "projectsCount" | "assessmentsCount";

const METRICS: Array<{
  label: string;
  icon: LucideIcon;
  key: MetricKey;
  hint: string;
}> = [
  {
    label: "Students",
    icon: Users,
    key: "studentsCount",
    hint: "Registered student accounts",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    key: "projectsCount",
    hint: "Active industry projects",
  },
  {
    label: "Assessments",
    icon: ClipboardList,
    key: "assessmentsCount",
    hint: "Published assessment sets",
  },
];

function formatCount(value: number | undefined) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    dashboardApi
      .getSummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => {
        if (isMounted) setLoadError(err.message || "Failed to load dashboard.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = useMemo(() => {
    if (!summary?.recentApplications) return 0;
    return summary.recentApplications.filter((app) => app.status === "PENDING")
      .length;
  }, [summary]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0b1c30]">
            Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#5b6575]">
            Snapshot of students, projects, and recent applications across the
            platform.
          </p>
        </div>
        {!isLoading && summary ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-xs text-[#5b6575]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#153a75]" />
            {pendingCount} pending in latest applications
          </div>
        ) : null}
      </div>

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {loadError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="admin-skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-3">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_45%,#dcecff_100%)] p-6 shadow-sm"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
                <div className="pointer-events-none absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-[#b7d4f5]/30" />
                <div className="relative z-10 flex h-full min-h-[148px] flex-col justify-between gap-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-[#3b6fb0] ring-1 ring-[#cfe0f5]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5a7aa0]">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-4xl font-bold tracking-tight text-[#1e4f8c]">
                      {formatCount(summary?.[metric.key])}
                    </p>
                    <p className="mt-2 text-xs text-[#7a94b3]">{metric.hint}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0b1c30]">
              Recent Applications
            </h2>
            <p className="text-sm text-[#5b6575]">
              Latest student submissions waiting for review.
            </p>
          </div>
          <Link
            href="/applications"
            className="hidden cursor-pointer rounded-lg border border-[#d7e0ef] bg-white px-3 py-2 text-xs font-semibold text-[#153a75] transition-colors hover:bg-[#eff4ff] sm:inline-flex"
          >
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="admin-skeleton h-72 rounded-2xl" />
        ) : (
          <ApplicationsTable
            applications={summary?.recentApplications ?? []}
            hideHeader
          />
        )}
      </section>
    </div>
  );
}

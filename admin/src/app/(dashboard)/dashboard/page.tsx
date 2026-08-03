"use client";

import { useEffect, useState } from "react";
import { Users, FolderKanban, ClipboardList } from "@/components/icons";
import StatCard from "@/components/ui/stat-card";
import ApplicationsTable from "@/components/tables/applications-table";
import { dashboardApi, type DashboardSummary } from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    dashboardApi
      .getSummary()
      .then((data) => { if (isMounted) setSummary(data); })
      .catch((err) => { if (isMounted) setLoadError(err.message || "Failed to load dashboard."); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const pendingCount =
    summary?.pendingApprovals ??
    summary?.recentApplications.filter((a) => a.status === "PENDING").length ??
    "—";

  return (
    <>
      <div className="rounded-lg bg-[#153a75] p-5 text-white sm:p-6">
        <h1 className="text-lg font-bold sm:text-xl">Welcome Back, Admin</h1>
        <p className="mt-1 max-w-xl text-sm text-blue-100">
          System status is currently{" "}
          <span className="font-semibold underline">nominal</span>. All
          diagnostic routines are running as scheduled. There are{" "}
          <span className="font-semibold">{pendingCount} pending student approvals</span>{" "}
          requiring your attention.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live Feed Active
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Last login: —
          </span>
        </div>
      </div>

      {loadError && (
        <p className="mt-4 text-sm text-red-500" role="alert">{loadError}</p>
      )}

      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard id="001" label="Students" value={summary?.studentsCount ?? 0} icon={Users} />
          <StatCard id="002" label="Projects" value={summary?.projectsCount ?? 0} icon={FolderKanban} />
          <StatCard id="003" label="Assessments" value={summary?.assessmentsCount ?? 0} icon={ClipboardList} />
        </div>
      )}

      <div className="mt-5">
        {isLoading ? (
          <div className="admin-skeleton h-64" />
        ) : (
          <ApplicationsTable applications={summary?.recentApplications ?? []} />
        )}
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Users, FolderKanban, ClipboardList, ShieldCheck } from "lucide-react";
import AdminShell from "../components/AdminShell";
import StatCard from "../components/Statcard";
import ApplicationsTable from "../components/Applicationstable";
import { dashboardApi, DashboardSummary } from "../lib/api";

export default function DashboardPage() {
  const [summary, setSummary]     = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    dashboardApi
      .getSummary()
      .then((data) => { if (isMounted) setSummary(data); })
      .catch((err) => { if (isMounted) setLoadError(err.message || "Failed to load dashboard."); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const pendingCount = summary?.recentApplications.filter((a) => a.status === "PENDING").length ?? "—";

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      onSidebarClose={() => setSidebarOpen(false)}
    >
          {/* Banner */}
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

          {/* Stat cards — 1 col mobile, 2 col sm, 4 col lg */}
          {isLoading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg border border-gray-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard id="001" label="Students"      value={summary?.studentsCount      ?? 0} icon={Users}         />
              <StatCard id="002" label="Projects"      value={summary?.projectsCount      ?? 0} icon={FolderKanban}  />
              <StatCard id="003" label="Assessments"   value={summary?.assessmentsCount   ?? 0} icon={ClipboardList} />
              <StatCard id="005" label="Active Mentors" value={summary?.activeMentorsCount ?? 0} icon={ShieldCheck} footnote="Verified access" />
            </div>
          )}

          {/* Applications table */}
          <div className="mt-5">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-white" />
            ) : (
              <ApplicationsTable applications={summary?.recentApplications ?? []} />
            )}
          </div>
    </AdminShell>
  );
}
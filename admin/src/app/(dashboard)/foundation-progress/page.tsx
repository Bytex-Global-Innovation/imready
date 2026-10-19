"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import StatCard from "@/components/ui/stat-card";
import {
  foundationApi,
  type FoundationProgressListItem,
  type FoundationProgressListResponse,
  type FoundationStatusFilter,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Foundation Progress" },
];

const STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  NOT_STARTED: "bg-surface text-muted",
} as const;

const FILTER_OPTIONS: { value: FoundationStatusFilter; label: string }[] = [
  { value: "ALL", label: "All students" },
  { value: "COMPLETE", label: "Completed all 5" },
  { value: "AT_LEAST_3", label: "Completed ≥ 3" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress (1–4)" },
];

export default function FoundationProgressPage() {
  const [data, setData] = useState<FoundationProgressListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<FoundationStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foundationApi.getProgressList(page, {
        search: debouncedSearch,
        status,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load foundation progress.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  function statusLabel(item: FoundationProgressListItem) {
    if (item.foundationComplete) return "COMPLETE";
    if (item.completedCount > 0) return "IN_PROGRESS";
    return "NOT_STARTED";
  }

  const summary = data?.summary;

  return (
    <div>
      <Breadcrumb items={BREADCRUMBS} />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Foundation Progress</h1>
          <p className="mt-1 text-sm text-muted">
            Track student mission submissions across the Stage 0 foundation flow.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Completed all 5 missions"
          value={String(summary?.completedAll ?? "—")}
        />
        <StatCard
          label="Completed at least 3 missions"
          value={String(summary?.completedAtLeast3 ?? "—")}
        />
        <StatCard
          label="Total students"
          value={String(summary?.totalStudents ?? "—")}
        />
      </div>

      <div className="admin-card mt-6 space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or college"
              className="w-full rounded-[var(--radius-button)] border border-border bg-white py-2.5 pr-3 pl-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold ${
                  status === value ? "bg-primary text-white" : "bg-surface text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="admin-table-header">
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">College</th>
                <th className="px-3 py-3">Problem statement</th>
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">XP</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last Updated</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.results ?? []).map((item) => {
                const label = statusLabel(item);
                return (
                  <tr key={item.studentId} className="admin-table-row">
                    <td className="px-3 py-3">
                      <p className="font-medium text-foreground">{item.studentName}</p>
                      <p className="text-xs text-muted">{item.email}</p>
                    </td>
                    <td className="px-3 py-3 text-muted">{item.collegeName || "—"}</td>
                    <td className="max-w-xs px-3 py-3 text-muted">
                      <p className="line-clamp-3 text-xs leading-relaxed">
                        {item.problemStatementText || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      {item.completedCount}/{item.totalMissions} missions
                      <p className="text-xs text-muted">Current: Mission {item.currentMission}</p>
                    </td>
                    <td className="px-3 py-3">{item.totalXp}</td>
                    <td className="px-3 py-3">
                      <span className={`admin-badge ${STATUS_STYLES[label]}`}>
                        {label.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {item.lastUpdatedAt
                        ? new Date(item.lastUpdatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/foundation-progress/${item.studentId}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isLoading ? <p className="text-sm text-muted">Loading…</p> : null}
        {!isLoading && (data?.results.length ?? 0) === 0 ? (
          <p className="text-sm text-muted">No students found.</p>
        ) : null}

        {data && data.total > 0 ? (
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalEntries={data.total}
            pageSize={20}
            entryLabel="students"
            onPageChange={loadData}
          />
        ) : null}
      </div>
    </div>
  );
}

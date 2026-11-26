"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import { useDataLoader } from "@/hooks/use-data-loader";
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
  COMPLETE: "bg-[#ecfdf5] text-[#047857]",
  IN_PROGRESS: "bg-[#fff7ed] text-[#c2410c]",
  NOT_STARTED: "bg-[#f1f5f9] text-[#64748b]",
} as const;

const FILTER_OPTIONS: { value: FoundationStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "COMPLETE", label: "Completed all 5" },
  { value: "AT_LEAST_3", label: "Completed ≥ 3" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress (1–4)" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function statusKey(item: FoundationProgressListItem) {
  if (item.foundationComplete) return "COMPLETE" as const;
  if (item.completedCount > 0) return "IN_PROGRESS" as const;
  return "NOT_STARTED" as const;
}

function statusText(key: keyof typeof STATUS_STYLES) {
  if (key === "COMPLETE") return "Complete";
  if (key === "IN_PROGRESS") return "In progress";
  return "Not started";
}

export default function FoundationProgressPage() {
  const [data, setData] = useState<FoundationProgressListResponse | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<FoundationStatusFilter>("ALL");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const { begin, end } = useDataLoader();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async (page: number) => {
    const requestId = ++requestIdRef.current;
    begin();
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);
    try {
      const response = await foundationApi.getProgressList(page, {
        search: debouncedSearch,
        status,
      });
      if (requestId !== requestIdRef.current) return;
      setData(response);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load foundation progress.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        end();
      }
    }
  }, [begin, debouncedSearch, end, status]);

  useEffect(() => {
    void loadData(1);
  }, [loadData]);

  const summary = data?.summary;
  const results = data?.results ?? [];
  const showEmpty = !isInitialLoading && results.length === 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Stage 0
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Foundation Progress
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Track student mission submissions across the Stage 0 foundation flow.
            </p>
          </div>
          {data ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-[#3b6fb0] ${
                  isRefreshing ? "animate-pulse" : ""
                }`}
              />
              {data.total} student{data.total === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Completed all 5",
            value: summary?.completedAll ?? "—",
          },
          {
            label: "Completed ≥ 3",
            value: summary?.completedAtLeast3 ?? "—",
          },
          {
            label: "Total students",
            value: summary?.totalStudents ?? "—",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[#1e4f8c]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:px-5">
          <div className="relative w-full max-w-md">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a94b3]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or college…"
                className="w-full rounded-xl border border-[#cfe0f5] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
              Filter by progress
            </p>
            <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#cfe0f5] bg-white p-1">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    status === value
                      ? "bg-[#3b6fb0] text-white"
                      : "text-[#5a7aa0] hover:bg-[#eaf3ff] hover:text-[#1e4f8c]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isInitialLoading ? (
          <PanelLoader label="Loading foundation progress…" />
        ) : (
          <div
            className={`min-h-[280px] transition-opacity duration-200 ${
              isRefreshing ? "pointer-events-none opacity-55" : "opacity-100"
            }`}
          >
            {showEmpty ? (
              <div className="flex min-h-[280px] items-center justify-center px-6 py-12 text-center">
                <div>
                  <p className="text-sm font-medium text-[#0b1c30]">
                    No students found
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Try another search or progress filter.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e8eef6] bg-[#f7faff] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                        <th className="px-5 py-3.5">Student</th>
                        <th className="px-3 py-3.5">College</th>
                        <th className="px-3 py-3.5">Problem statement</th>
                        <th className="px-3 py-3.5">Progress</th>
                        <th className="px-3 py-3.5">XP</th>
                        <th className="px-3 py-3.5">Status</th>
                        <th className="px-3 py-3.5">Last updated</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item) => {
                        const key = statusKey(item);
                        return (
                          <tr
                            key={item.studentId}
                            className="border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                                  {initials(item.studentName)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-[#0b1c30]">
                                    {item.studentName}
                                  </p>
                                  <p className="truncate text-xs text-[#6b7280]">
                                    {item.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-[#475569]">
                              {item.collegeName || "—"}
                            </td>
                            <td className="max-w-[220px] px-3 py-4">
                              <p className="line-clamp-2 text-xs leading-relaxed text-[#64748b]">
                                {item.problemStatementText || "—"}
                              </p>
                            </td>
                            <td className="px-3 py-4">
                              <p className="font-semibold text-[#1e4f8c]">
                                {item.completedCount}/{item.totalMissions} missions
                              </p>
                              <p className="text-xs text-[#7a94b3]">
                                Current: Mission {item.currentMission}
                              </p>
                            </td>
                            <td className="px-3 py-4 font-semibold text-[#0b1c30]">
                              {item.totalXp}
                            </td>
                            <td className="px-3 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[key]}`}
                              >
                                {statusText(key)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-[#64748b]">
                              {item.lastUpdatedAt
                                ? new Date(item.lastUpdatedAt).toLocaleString()
                                : "—"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Link
                                href={`/foundation-progress/${item.studentId}`}
                                className="inline-flex cursor-pointer items-center rounded-md border border-[#d7e0ef] px-2.5 py-1.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
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

                <div className="flex flex-col gap-3 p-4 lg:hidden">
                  {results.map((item) => {
                    const key = statusKey(item);
                    return (
                      <div
                        key={item.studentId}
                        className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-xs font-semibold text-white">
                            {initials(item.studentName)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#0b1c30]">
                                  {item.studentName}
                                </p>
                                <p className="truncate text-xs text-[#6b7280]">
                                  {item.email}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[key]}`}
                              >
                                {statusText(key)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#475569]">
                              {item.collegeName || "—"}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#1e4f8c]">
                              {item.completedCount}/{item.totalMissions} missions ·{" "}
                              {item.totalXp} XP
                            </p>
                            {item.problemStatementText ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#64748b]">
                                {item.problemStatementText}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-3 border-t border-[#e8eef6] pt-3">
                          <Link
                            href={`/foundation-progress/${item.studentId}`}
                            className="inline-flex cursor-pointer text-sm font-semibold text-[#3b6fb0] hover:underline"
                          >
                            View evidence →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {data && data.total > 0 ? (
              <div className="border-t border-[#e8eef6] bg-[#f7faff] px-4 py-3 sm:px-5">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalEntries={data.total}
                  pageSize={20}
                  entryLabel="students"
                  onPageChange={(page) => void loadData(page)}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

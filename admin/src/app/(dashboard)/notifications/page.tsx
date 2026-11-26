"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import { useDataLoader } from "@/hooks/use-data-loader";
import {
  foundationApi,
  type FoundationVerificationFilter,
  type FoundationVerificationListResponse,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notifications" },
];

const STATUS_STYLES = {
  PENDING: "bg-[#fff7ed] text-[#c2410c]",
  PASSED: "bg-[#ecfdf5] text-[#047857]",
  FAILED: "bg-[#fef2f2] text-[#b91c1c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
} as const;

const FILTERS: FoundationVerificationFilter[] = [
  "PENDING",
  "PASSED",
  "FAILED",
  "ALL",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function filterLabel(value: FoundationVerificationFilter) {
  if (value === "ALL") return "All";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function AdminNotificationsPage() {
  const [data, setData] = useState<FoundationVerificationListResponse | null>(null);
  const [filter, setFilter] = useState<FoundationVerificationFilter>("PENDING");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const { begin, end } = useDataLoader();

  const loadData = useCallback(async (page: number, status: FoundationVerificationFilter) => {
    const requestId = ++requestIdRef.current;
    begin();
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);
    try {
      const response = await foundationApi.getVerificationRequests(page, status);
      if (requestId !== requestIdRef.current) return;
      setData(response);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        end();
      }
    }
  }, [begin, end]);

  useEffect(() => {
    void loadData(1, filter);
  }, [loadData, filter]);

  const notifications = data?.notifications ?? [];
  const showEmpty = !isInitialLoading && notifications.length === 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Inbox
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Notifications
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Review Foundation submissions after Mission 5. Open a student&apos;s
              evidence to pass or mark as not passed.
            </p>
          </div>
          {data ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-[#3b6fb0] ${
                  isRefreshing ? "animate-pulse" : ""
                }`}
              />
              {data.pendingCount} pending
            </div>
          ) : null}
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
            {data
              ? `${data.pendingCount} pending · ${data.total} in this view`
              : "Filter by status"}
          </p>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#cfe0f5] bg-white p-1">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === value
                    ? "bg-[#3b6fb0] text-white"
                    : "text-[#5a7aa0] hover:bg-[#eaf3ff] hover:text-[#1e4f8c]"
                }`}
              >
                {filterLabel(value)}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isInitialLoading ? (
          <PanelLoader label="Loading notifications…" />
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
                    No foundation verification requests
                  </p>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Try another status filter or check back later.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-[#eef2f7]">
                  {notifications.map((item) => {
                    const status = item.foundationVerificationStatus;
                    return (
                      <li
                        key={item.id}
                        className="px-4 py-4 transition-colors hover:bg-[#f7faff] sm:px-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-xs font-semibold text-white">
                              {initials(item.studentName)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                                  Foundation verification
                                </p>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
                                >
                                  {status.charAt(0) + status.slice(1).toLowerCase()}
                                </span>
                              </div>
                              <h2 className="mt-1 truncate text-base font-semibold text-[#0b1c30]">
                                {item.studentName}
                              </h2>
                              <p className="truncate text-sm text-[#6b7280]">
                                {item.email}
                              </p>
                              <p className="mt-1 text-sm text-[#475569]">
                                {item.collegeName || "—"}
                              </p>
                              <p className="mt-1.5 text-xs text-[#7a94b3]">
                                Requested {item.requestedAtLabel || "recently"}
                              </p>
                              {item.foundationVerificationNote ? (
                                <p className="mt-2 text-sm text-[#475569]">
                                  Note: {item.foundationVerificationNote}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Link
                            href={`/foundation-progress/${item.studentId}`}
                            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
                          >
                            View foundation evidence →
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {data && data.total > 0 ? (
                  <div className="border-t border-[#e8eef6] bg-[#f7faff] px-4 py-3 sm:px-5">
                    <Pagination
                      currentPage={data.page}
                      totalPages={data.totalPages}
                      totalEntries={data.total}
                      pageSize={20}
                      entryLabel="requests"
                      onPageChange={(page) => void loadData(page, filter)}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import {
  foundationApi,
  type FoundationVerificationFilter,
  type FoundationVerificationListResponse,
  type FoundationVerificationRequest,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notifications" },
];

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  PASSED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-600",
  NONE: "bg-gray-50 text-gray-600",
} as const;

export default function AdminNotificationsPage() {
  const [data, setData] = useState<FoundationVerificationListResponse | null>(null);
  const [filter, setFilter] = useState<FoundationVerificationFilter>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const loadData = useCallback(async (page: number, status: FoundationVerificationFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foundationApi.getVerificationRequests(page, status);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, filter);
  }, [loadData, filter]);

  async function review(
    item: FoundationVerificationRequest,
    decision: "PASSED" | "FAILED",
  ) {
    setBusyId(item.studentId);
    setError(null);
    setMessage(null);
    try {
      await foundationApi.reviewVerification(
        item.studentId,
        decision,
        noteDraft[item.studentId],
      );
      setMessage(
        decision === "PASSED"
          ? `${item.studentName} passed Foundation verification.`
          : `${item.studentName} was marked as not passed.`,
      );
      await loadData(data?.page || 1, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update verification.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6">
        <h1 className="admin-page-title">Notifications</h1>
        <p className="admin-page-subtitle">
          Review Foundation submissions after Mission 5. Passing unlocks unpaid project details for that student.
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {data
              ? `${data.pendingCount} pending · ${data.total} in this view`
              : "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(["PENDING", "PASSED", "FAILED", "ALL"] as FoundationVerificationFilter[]).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filter === value
                      ? "bg-[#153a75] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {value === "ALL"
                    ? "All"
                    : value.charAt(0) + value.slice(1).toLowerCase()}
                </button>
              ),
            )}
          </div>
        </div>

        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
        {message && <div className="p-4 text-sm text-emerald-600">{message}</div>}

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
            Loading notifications…
          </div>
        ) : (data?.notifications.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No foundation verification requests in this filter.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {data!.notifications.map((item) => {
                const status = item.foundationVerificationStatus;
                const pending = status === "PENDING";
                return (
                  <li key={item.id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
                            Foundation verification
                          </p>
                          <span className={`admin-badge ${STATUS_STYLES[status]}`}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <h2 className="mt-1 text-lg font-semibold text-gray-900">
                          {item.studentName}
                        </h2>
                        <p className="text-sm text-gray-500">{item.email}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          {item.collegeName || "—"}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Requested {item.requestedAtLabel || "recently"}
                        </p>
                        {item.foundationVerificationNote ? (
                          <p className="mt-2 text-sm text-gray-600">
                            Note: {item.foundationVerificationNote}
                          </p>
                        ) : null}
                        <Link
                          href={`/foundation-progress/${item.studentId}`}
                          className="mt-2 inline-block text-sm font-medium text-[#153a75] hover:underline"
                        >
                          View foundation evidence →
                        </Link>
                      </div>

                      {pending ? (
                        <div className="flex w-full max-w-sm flex-col gap-2">
                          <textarea
                            value={noteDraft[item.studentId] || ""}
                            onChange={(e) =>
                              setNoteDraft((prev) => ({
                                ...prev,
                                [item.studentId]: e.target.value,
                              }))
                            }
                            rows={2}
                            placeholder="Optional review note"
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#153a75]"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busyId === item.studentId}
                              onClick={() => void review(item, "PASSED")}
                              className="rounded-lg bg-[#153a75] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              {busyId === item.studentId ? "…" : "Pass"}
                            </button>
                            <button
                              type="button"
                              disabled={busyId === item.studentId}
                              onClick={() => void review(item, "FAILED")}
                              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                            >
                              Not passed
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            {data && data.totalPages > 1 ? (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalEntries={data.total}
                  pageSize={20}
                  entryLabel="requests"
                  onPageChange={(page) => loadData(page, filter)}
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

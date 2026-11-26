"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import { useDataLoader } from "@/hooks/use-data-loader";
import {
  projectsApi,
  type Stage2ReviewStatusFilter,
  type Stage2ReviewsResponse,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Stage 2 Reviews" },
];

const FILTERS: Stage2ReviewStatusFilter[] = [
  "ALL",
  "SUBMITTED",
  "AWAITING_FEEDBACK",
  "FEEDBACK_READY",
];

const SUBMISSION_STYLES: Record<string, string> = {
  SUBMITTED: "bg-[#eaf3ff] text-[#3b6fb0]",
  DRAFT: "bg-[#fff7ed] text-[#c2410c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
};

const FEEDBACK_STYLES: Record<string, string> = {
  SUBMITTED: "bg-[#ecfdf5] text-[#047857]",
  DRAFT: "bg-[#fff7ed] text-[#c2410c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
};

function filterLabel(value: Stage2ReviewStatusFilter) {
  if (value === "ALL") return "All active";
  if (value === "AWAITING_FEEDBACK") return "Awaiting feedback";
  if (value === "FEEDBACK_READY") return "Feedback ready";
  return "Submitted";
}

function statusText(value: string) {
  if (!value) return "—";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function ProjectReviewsPage() {
  const [data, setData] = useState<Stage2ReviewsResponse | null>(null);
  const [filter, setFilter] = useState<Stage2ReviewStatusFilter>("ALL");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const { begin, end } = useDataLoader();

  const loadData = useCallback(async (page: number, status: Stage2ReviewStatusFilter) => {
    const requestId = ++requestIdRef.current;
    begin();
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);
    try {
      const response = await projectsApi.getReviews(page, status);
      if (requestId !== requestIdRef.current) return;
      setData(response);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
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

  const reviews = data?.reviews ?? [];
  const showEmpty = !isInitialLoading && !error && reviews.length === 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Owner portal
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Stage 2 Reviews
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Review submitted teams and publish industry feedback for students.
            </p>
          </div>
          {data ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span
                className={`h-1.5 w-1.5 rounded-full bg-[#3b6fb0] ${
                  isRefreshing ? "animate-pulse" : ""
                }`}
              />
              {data.total} team{data.total === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
            Filter by status
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
          <PanelLoader label="Loading reviews…" />
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
                    No teams match this filter
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-[#6b7280]">
                    Students must finalize a team and submit work before reviews
                    appear here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e8eef6] bg-[#f7faff] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                        <th className="px-5 py-3.5">Project</th>
                        <th className="px-3 py-3.5">Team</th>
                        <th className="px-3 py-3.5">Members</th>
                        <th className="px-3 py-3.5">Submission</th>
                        <th className="px-3 py-3.5">Feedback</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((row) => (
                        <tr
                          key={row.teamId}
                          className="border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[#0b1c30]">
                              {row.projectTitle}
                            </p>
                            <p className="text-xs text-[#7a94b3]">
                              {row.projectCompanyName || row.projectSlug}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                                {initials(row.teamName)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-[#1e4f8c]">
                                  {row.teamName}
                                </p>
                                <p className="text-xs text-[#7a94b3]">
                                  #{row.teamId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 font-semibold text-[#0b1c30]">
                            {row.memberCount}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                SUBMISSION_STYLES[row.submissionStatus] ||
                                SUBMISSION_STYLES.NONE
                              }`}
                            >
                              {statusText(row.submissionStatus)}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                FEEDBACK_STYLES[row.feedbackStatus] ||
                                FEEDBACK_STYLES.NONE
                              }`}
                            >
                              {statusText(row.feedbackStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/project-reviews/${row.teamId}`}
                              className="inline-flex cursor-pointer items-center rounded-md border border-[#d7e0ef] px-2.5 py-1.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
                            >
                              Open feedback
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 p-4 lg:hidden">
                  {reviews.map((row) => (
                    <div
                      key={row.teamId}
                      className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-xs font-semibold text-white">
                          {initials(row.teamName)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0b1c30]">
                            {row.projectTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-[#7a94b3]">
                            {row.projectCompanyName || row.projectSlug}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#1e4f8c]">
                            {row.teamName}
                          </p>
                          <p className="mt-1 text-xs text-[#7a94b3]">
                            #{row.teamId} · {row.memberCount} member
                            {row.memberCount === 1 ? "" : "s"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                SUBMISSION_STYLES[row.submissionStatus] ||
                                SUBMISSION_STYLES.NONE
                              }`}
                            >
                              {statusText(row.submissionStatus)}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                FEEDBACK_STYLES[row.feedbackStatus] ||
                                FEEDBACK_STYLES.NONE
                              }`}
                            >
                              Feedback: {statusText(row.feedbackStatus)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-[#e8eef6] pt-3">
                        <Link
                          href={`/project-reviews/${row.teamId}`}
                          className="inline-flex cursor-pointer text-sm font-semibold text-[#3b6fb0] hover:underline"
                        >
                          Open owner feedback →
                        </Link>
                      </div>
                    </div>
                  ))}
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
                  entryLabel="teams"
                  onPageChange={(page) => void loadData(page, filter)}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

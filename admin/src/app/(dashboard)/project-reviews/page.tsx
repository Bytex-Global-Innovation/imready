"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
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

export default function ProjectReviewsPage() {
  const [data, setData] = useState<Stage2ReviewsResponse | null>(null);
  const [filter, setFilter] = useState<Stage2ReviewStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (page: number, status: Stage2ReviewStatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getReviews(page, status);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(1, filter);
  }, [loadData, filter]);

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6">
        <h1 className="admin-page-title">Stage 2 Reviews</h1>
        <p className="admin-page-subtitle">
          Owner portal — review submitted teams and publish industry feedback for students.
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {data ? `${data.total} team${data.total === 1 ? "" : "s"}` : "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((value) => (
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
                  ? "All active"
                  : value === "AWAITING_FEEDBACK"
                    ? "Awaiting feedback"
                    : value === "FEEDBACK_READY"
                      ? "Feedback ready"
                      : "Submitted"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
            Loading reviews…
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : !data?.reviews.length ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No ACTIVE teams match this filter yet. Students must finalize a team and submit
            work first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="admin-table-header">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Submission</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.reviews.map((row) => (
                  <tr key={row.teamId} className="admin-table-row">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{row.projectTitle}</div>
                      <div className="text-xs text-gray-500">
                        {row.projectCompanyName || row.projectSlug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{row.teamName}</div>
                      <div className="text-xs text-gray-500">#{row.teamId}</div>
                    </td>
                    <td className="px-4 py-3">{row.memberCount}</td>
                    <td className="px-4 py-3">
                      <span className="admin-badge bg-blue-50 text-blue-700">
                        {row.submissionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`admin-badge ${
                          row.feedbackStatus === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : row.feedbackStatus === "DRAFT"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.feedbackStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/project-reviews/${row.teamId}`}
                        className="text-sm font-semibold text-[#153a75] hover:underline"
                      >
                        Open owner feedback →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 ? (
          <div className="border-t border-gray-200 p-4">
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
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import {
  projectsApi,
  type ApplicationStatusFilter,
  type ProjectApplicationsResponse,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Applications" },
];

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
} as const;

export default function ApplicationsPage() {
  const [data, setData] = useState<ProjectApplicationsResponse | null>(null);
  const [filter, setFilter] = useState<ApplicationStatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (page: number, status: ApplicationStatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getApplications(page, status);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, filter);
  }, [loadData, filter]);

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6">
        <h1 className="admin-page-title">Project Applications</h1>
        <p className="admin-page-subtitle">
          Review each student&apos;s motivation, contribution areas, and project interest.
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {data ? `${data.total} application${data.total === 1 ? "" : "s"}` : "—"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as ApplicationStatusFilter[]).map(
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

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
            Loading applications…
          </div>
        ) : (data?.applications.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No applications found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr className="admin-table-header">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Team size</th>
                    <th className="px-4 py-3">Contributions</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data!.applications.map((item) => (
                    <tr key={item.id} className="admin-table-row">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{item.studentName}</p>
                        <p className="text-xs text-gray-400">{item.studentEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#153a75]">{item.projectTitle}</p>
                        <p className="text-xs text-gray-400">
                          {item.projectCompanyName || item.projectSlug}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.projectTeamSizeLabel || `${item.projectTeamSize} students`}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.contributions.length > 0
                          ? item.contributions.join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.submittedAtLabel || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`admin-badge ${STATUS_STYLES[item.status]}`}>
                          {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/applications/${item.id}`}
                          className="text-sm font-medium text-[#153a75] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 p-4 sm:hidden">
              {data!.applications.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.studentName}</p>
                      <p className="text-xs text-gray-400">{item.studentEmail}</p>
                    </div>
                    <span className={`admin-badge ${STATUS_STYLES[item.status]}`}>
                      {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#153a75]">{item.projectTitle}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Team: {item.projectTeamSizeLabel || `${item.projectTeamSize} students`}
                  </p>
                  <Link
                    href={`/applications/${item.id}`}
                    className="mt-3 inline-block text-sm font-medium text-[#153a75]"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalEntries={data.total}
                  pageSize={20}
                  entryLabel="applications"
                  onPageChange={(page) => loadData(page, filter)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

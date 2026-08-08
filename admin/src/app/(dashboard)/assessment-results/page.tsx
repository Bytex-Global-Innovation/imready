"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Filter, Trash2 } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import Pagination from "@/components/ui/pagination";
import {
  assessmentsApi,
  type AssessmentResultListItem,
  type AssessmentResultsResponse,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Assessment Results" },
];

type ResultFilter = "ALL" | "PASS" | "FAIL" | "PENDING";

const RESULT_STYLES = {
  PASS: "bg-emerald-50 text-emerald-700",
  FAIL: "bg-red-50 text-red-600",
  PENDING: "bg-amber-50 text-amber-700",
} as const;

type DeleteTarget =
  | { type: "one"; id: string; label: string }
  | { type: "bulk"; ids: string[] }
  | null;

export default function AssessmentResultsPage() {
  const [data, setData] = useState<AssessmentResultsResponse | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const loadData = useCallback(async (page: number, resultFilter: ResultFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assessmentsApi.getResults(page, resultFilter);
      setData(response);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, filter);
  }, [loadData, filter]);

  const pageIds = useMemo(
    () => (data?.results ?? []).map((item) => item.id),
    [data],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allPageSelected;

  function resultLabel(item: AssessmentResultListItem) {
    if (item.result === "PASS" || item.result === "FAIL") return item.result;
    return "PENDING";
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    setMessage(null);
    try {
      if (deleteTarget.type === "one") {
        await assessmentsApi.deleteResult(deleteTarget.id);
        setMessage("Submission deleted.");
      } else {
        const result = await assessmentsApi.bulkDeleteResults(deleteTarget.ids);
        setMessage(
          `Deleted ${result.deletedCount} submission${result.deletedCount === 1 ? "" : "s"}.`,
        );
      }
      setDeleteTarget(null);
      await loadData(data?.page ?? 1, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBulkDownload() {
    setIsDownloading(true);
    setError(null);
    setMessage(null);
    try {
      await assessmentsApi.downloadResultsExport(filter);
      setMessage("Results Excel downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download results.");
    } finally {
      setIsDownloading(false);
    }
  }

  const deleteTitle =
    deleteTarget?.type === "bulk" ? "Delete selected submissions" : "Delete submission";
  const deleteMessage =
    deleteTarget?.type === "bulk"
      ? `Delete ${deleteTarget.ids.length} selected submission${deleteTarget.ids.length === 1 ? "" : "s"}? This cannot be undone.`
      : deleteTarget?.type === "one"
        ? `Delete submission for "${deleteTarget.label}"? This cannot be undone.`
        : "";

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Assessment Results</h1>
          <p className="admin-page-subtitle">
            Auto-scored jumbled options, manually score personal responses, then full evaluate.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="admin-btn-outline gap-2"
            disabled={isDownloading}
            onClick={handleBulkDownload}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading…" : "Bulk Download"}
          </button>
          {selectedIds.size > 0 && (
            <button
              type="button"
              className="admin-btn-outline gap-2 border-red-200 text-red-600 hover:bg-red-50"
              disabled={isDeleting}
              onClick={() => setDeleteTarget({ type: "bulk", ids: [...selectedIds] })}
            >
              <Trash2 className="h-4 w-4" />
              Delete selected ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            Filter by result
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "PASS", "FAIL", "PENDING"] as ResultFilter[]).map((value) => (
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
                {value === "ALL" ? "All" : value === "PASS" ? "Pass" : value === "FAIL" ? "Fail" : "Pending"}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="p-4 text-sm text-red-500">{error}</div>}
        {message && <div className="p-4 text-sm text-emerald-600">{message}</div>}

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
            Loading results…
          </div>
        ) : (data?.results.length ?? 0) === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No submissions found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr className="admin-table-header">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-gray-300"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected;
                        }}
                        onChange={toggleAllOnPage}
                        aria-label="Select all on this page"
                      />
                    </th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Assessment</th>
                    <th className="px-4 py-3">Jumbled</th>
                    <th className="px-4 py-3">Personal</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data!.results.map((item) => {
                    const label = resultLabel(item);
                    const checked = selectedIds.has(item.id);
                    return (
                      <tr key={item.id} className="admin-table-row">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-gray-300"
                            checked={checked}
                            onChange={() => toggleOne(item.id)}
                            aria-label={`Select ${item.studentName}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{item.studentName}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.collegeName}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#153a75]">{item.assessmentName}</p>
                          <p className="text-xs text-gray-400">{item.domain}</p>
                        </td>
                        <td className="px-4 py-3">{item.jumbledScore}</td>
                        <td className="px-4 py-3">
                          {item.personalScore == null ? "—" : item.personalScore}
                        </td>
                        <td className="px-4 py-3">
                          {item.totalScore == null
                            ? "—"
                            : `${item.totalScore}/${item.maxScore}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`admin-badge ${RESULT_STYLES[label]}`}>{label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/assessment-results/${item.id}`}
                              className="text-sm font-medium text-[#153a75] hover:underline"
                            >
                              Evaluate
                            </Link>
                            <button
                              type="button"
                              aria-label={`Delete ${item.studentName}`}
                              className="cursor-pointer text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
                              disabled={isDeleting}
                              onClick={() =>
                                setDeleteTarget({
                                  type: "one",
                                  id: item.id,
                                  label: item.studentName,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 p-4 sm:hidden">
              {data!.results.map((item) => {
                const label = resultLabel(item);
                const checked = selectedIds.has(item.id);
                return (
                  <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300"
                          checked={checked}
                          onChange={() => toggleOne(item.id)}
                          aria-label={`Select ${item.studentName}`}
                        />
                        <span>
                          <p className="font-semibold text-gray-900">{item.studentName}</p>
                          <p className="text-xs text-gray-400">{item.email}</p>
                        </span>
                      </label>
                      <span className={`admin-badge ${RESULT_STYLES[label]}`}>{label}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{item.collegeName}</p>
                    <p className="mt-1 text-sm font-medium text-[#153a75]">{item.assessmentName}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <Link
                        href={`/assessment-results/${item.id}`}
                        className="text-sm font-medium text-[#153a75]"
                      >
                        Evaluate →
                      </Link>
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 disabled:opacity-50"
                        disabled={isDeleting}
                        onClick={() =>
                          setDeleteTarget({
                            type: "one",
                            id: item.id,
                            label: item.studentName,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4">
              <Pagination
                currentPage={data?.page ?? 1}
                totalPages={data?.totalPages ?? 1}
                totalEntries={data?.total ?? 0}
                pageSize={10}
                onPageChange={(page) => loadData(page, filter)}
                entryLabel="results"
              />
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTitle}
        message={deleteMessage}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}

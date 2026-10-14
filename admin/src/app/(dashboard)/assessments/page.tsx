"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ClipboardList,
  ShieldCheck,
  Upload,
} from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import Select from "@/components/ui/select";
import StatCard from "@/components/ui/stat-card";
import AssessmentsTable from "@/components/tables/assessments-table";
import BulkUploadAssessmentModal from "@/components/ui/bulk-upload-assessment-modal";
import { assessmentsApi, type AssessmentsResponse } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Assessments" },
];

export default function AssessmentsPage() {
  const [data, setData] = useState<AssessmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assessmentsApi.getAssessments(page);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assessments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  async function handleDelete(id: string) {
    try {
      await assessmentsApi.deleteAssessment(id);
      await loadData(data?.page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive assessment.");
    }
  }

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Assessments</h1>
          <p className="admin-page-subtitle">Manage curriculum evaluations, domain tests, and pass rates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="admin-btn-outline gap-2"
            onClick={() => setBulkOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Bulk Add
          </button>
          <Link href="/assessments/create" className="admin-btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Create Assessment
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && !data ? (
          <>
            <div className="admin-skeleton h-28" />
            <div className="admin-skeleton h-28" />
            <div className="admin-skeleton h-28" />
            <div className="admin-skeleton h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Total Assessments"
              value={data?.total ?? 0}
              icon={ClipboardList}
            />
            <StatCard
              label="Added This Month"
              value={`+${data?.totalThisMonth ?? 0}`}
              subtitleColor="green"
            />
            <StatCard
              label="Active Sessions"
              value={data?.activeSessions ?? 0}
            />
            <StatCard
              label="Avg. Pass Rate"
              value={data?.avgPassRate ?? "0%"}
              icon={ShieldCheck}
            />
          </>
        )}
      </div>

      <div className="admin-card">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full min-w-0 max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              className="admin-input-icon w-full"
            />
          </div>
          <div className="w-full min-w-0 sm:w-48">
            <Select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}

        <div className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">Loading assessments...</div>
          ) : (
            <AssessmentsTable
              assessments={(data?.assessments ?? []).filter(
                (item) => statusFilter === "ALL" || item.status === statusFilter,
              )}
              onDelete={handleDelete}
            />
          )}
        </div>

        {!isLoading && (data?.total ?? 0) > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              totalEntries={data?.total ?? 0}
              pageSize={5}
              onPageChange={loadData}
              entryLabel="assessments"
            />
          </div>
        )}
      </div>

      <BulkUploadAssessmentModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => loadData(1)}
      />
    </>
  );
}

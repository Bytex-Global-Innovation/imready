"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Users, ShieldCheck } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import StatCard from "@/components/ui/stat-card";
import MentorsTable from "@/components/tables/mentors-table";
import { mentorsApi, type MentorsResponse } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Mentors Management" },
];

export default function MentorsPage() {
  const [data, setData] = useState<MentorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mentorsApi.getMentors(page);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mentors.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Mentors Management</h1>
          <p className="admin-page-subtitle">Track mentor assignments, project load, and team allocations.</p>
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
              label="Total Mentors"
              value={data?.totalMentors ?? 0}
              icon={ShieldCheck}
            />
            <StatCard
              label="Active Projects"
              value={data?.activeProjects ?? 0}
              subtitle={`${data?.soloProjects ?? 0} Solo · ${data?.teamProjects ?? 0} Team`}
            />
            <StatCard
              label="Students Guided"
              value={data?.studentsGuided ?? 0}
              icon={Users}
            />
            <StatCard
              label="Avg. Load"
              value={data?.avgStudentsPerMentor ?? "0"}
              footnote="Students per mentor"
            />
          </>
        )}
      </div>

      <div className="admin-card">
        {/* Search header */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search mentors by name, ID or project..."
              className="admin-input-icon w-full"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}

        <div className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">Loading mentors...</div>
          ) : (
            <MentorsTable mentors={data?.mentors ?? []} />
          )}
        </div>

        {!isLoading && (data?.total ?? 0) > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              totalEntries={data?.total ?? 0}
              pageSize={4} // from mock
              onPageChange={loadData}
              entryLabel="mentors"
            />
          </div>
        )}
      </div>
    </>
  );
}

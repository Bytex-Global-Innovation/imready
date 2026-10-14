"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Building2, Filter, Home, Users } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import StatCard from "@/components/ui/stat-card";
import CollegesTable from "@/components/tables/colleges-table";
import { collegesApi, type College, type CollegesSummary } from "@/lib/api";


const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Colleges Management" },
];

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const [debouncedFn, setDebouncedFn] = useState<T>(() => callback);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFn(() => callback);
    }, delay);
    return () => clearTimeout(handler);
  }, [callback, delay]);
  return debouncedFn;
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [summary, setSummary] = useState<CollegesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Simple debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await collegesApi.getColleges(page, search);
      setColleges(data.colleges);
      setSummary(data.summary);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalEntries(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load colleges.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset to page 1 when search changes
    loadData(1, debouncedSearch);
  }, [debouncedSearch, loadData]);

  const handlePageChange = (newPage: number) => {
    loadData(newPage, debouncedSearch);
  };

  const occupancyPercent = summary?.totalSeatCapacity
    ? (summary.enrolledStudents / summary.totalSeatCapacity) * 100
    : 0;

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Colleges Management</h1>
          <p className="admin-page-subtitle">Track institutional partnerships and student enrollment capacity.</p>
        </div>
      </div>

      {/* College specific stat cards using shared StatCard */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading && !summary ? (
          <>
            <div className="admin-skeleton h-28" />
            <div className="admin-skeleton h-28" />
            <div className="admin-skeleton h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Partner Institutions"
              value={summary?.totalInstitutions ?? 0}
              icon={Home}
            />
            <StatCard
              label="Total Enrolled Students"
              value={summary?.enrolledStudents ?? 0}
              icon={Users}
            />
            <StatCard
              label="Overall Occupancy"
              value={`${occupancyPercent.toFixed(1)}%`}
              subtitle={`${summary?.totalSeatCapacity?.toLocaleString("en-IN") ?? 0} Seats`}
              subtitleColor="blue"
              icon={Building2}
              progress={occupancyPercent}
            />
          </>
        )}
      </div>

      <div className="admin-card">
        {/* Filters/Search */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input-icon w-full"
            />
          </div>
          <button className="admin-btn-outline gap-2 bg-gray-50/50 text-gray-600">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}

        <div className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">Loading institutions...</div>
          ) : (
            <CollegesTable colleges={colleges} />
          )}
        </div>

        {!isLoading && totalEntries > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={4} // matched to mock API
              onPageChange={handlePageChange}
              entryLabel="institutions"
            />
          </div>
        )}
      </div>
    </>
  );
}

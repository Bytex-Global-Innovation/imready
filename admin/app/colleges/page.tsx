"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Filter, Home, Users } from "lucide-react";
import AdminShell from "@/app/components/AdminShell";
import CollegeStatCard from "@/app/components/CollegeStatCard";
import CollegesTable from "@/app/components/CollegesTable";
import Pagination from "@/app/components/Pagination";
import { collegesApi, type CollegesResponse } from "@/app/lib/api";

const PAGE_SIZE = 4;

export default function CollegesPage() {
  const [data, setData] = useState<CollegesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    collegesApi
      .getColleges(currentPage, debouncedSearch)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setLoadError(err.message || "Failed to load colleges.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearch]);

  const institutionProgress = data?.summary.totalInstitutions
    ? Math.min(100, (data.summary.totalInstitutions / 50) * 100)
    : 0;

  const enrollmentProgress =
    data?.summary.totalSeatCapacity && data.summary.totalSeatCapacity > 0
      ? (data.summary.enrolledStudents / data.summary.totalSeatCapacity) * 100
      : 0;

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      onSidebarClose={() => setSidebarOpen(false)}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#153a75]"
      >
        <Link
          href="/dashboard"
          className="flex cursor-pointer items-center text-[#153a75] transition-colors hover:text-[#153a75]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153a75] focus-visible:ring-offset-2"
          aria-label="Go to dashboard"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <span className="text-gray-300" aria-hidden="true">
          /
        </span>
        <span>Registry</span>
        <span className="text-gray-300" aria-hidden="true">
          /
        </span>
        <span>Colleges</span>
      </nav>

      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Colleges Management</h1>
      <p className="mt-1 max-w-3xl text-sm text-gray-500">
        Manage institutional partners, enrollment quotas, and coordinator assignments across
        the global education network.
      </p>

      {loadError ? (
        <p className="mt-4 text-sm text-red-500" role="alert">
          {loadError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-lg border border-gray-200 bg-white" />
          <div className="h-36 animate-pulse rounded-lg border border-gray-200 bg-white" />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CollegeStatCard
            label="Total Institutions"
            value={data?.summary.totalInstitutions ?? 0}
            icon={Building2}
            progressPercent={institutionProgress}
          />
          <CollegeStatCard
            label="Enrolled Students"
            value={data?.summary.enrolledStudents ?? 0}
            icon={Users}
            footnote={`Capacity: ${(data?.summary.totalSeatCapacity ?? 0).toLocaleString("en-IN")} Seats Total`}
            progressPercent={enrollmentProgress}
          />
        </div>
      )}

      <div className="mt-5 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">College Registry</h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {data?.summary.totalInstitutions ?? 0} Total
            </span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="college-filter" className="sr-only">
              Filter by name or ID
            </label>
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="college-filter"
              type="search"
              placeholder="Filter by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full cursor-text rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75]"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              <CollegesTable colleges={data?.colleges ?? []} />
              <div className="mt-4">
                <Pagination
                  currentPage={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 1}
                  totalEntries={data?.total ?? 0}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

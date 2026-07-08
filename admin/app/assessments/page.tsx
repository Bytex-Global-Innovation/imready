"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import Topbar from "@/app/components/Topbar";
import Sidebar from "@/app/components/Sidebar";
import Breadcrumb from "@/app/components/Breadcrumb";
import AssessmentStatCard from "@/app/components/AssessmentStatCard";
import AssessmentsTable from "@/app/components/AssessmentsTable";
import { assessmentsApi, Assessment, AssessmentsResponse } from "../lib/api";

const DOMAINS  = ["All Domains",  "Computer Science", "Machine Learning", "Infrastructure", "Mainframe", "Cyber Security"];
const STATUSES = ["All Statuses", "ACTIVE", "DRAFT", "ARCHIVED"];

export default function AssessmentsPage() {
  const [data, setData]               = useState<AssessmentsResponse | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState("");
  const [domain, setDomain]           = useState("All Domains");
  const [status, setStatus]           = useState("All Statuses");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    assessmentsApi
      .getAssessments(currentPage)
      .then((res) => { if (isMounted) setData(res); })
      .catch((err) => { if (isMounted) setLoadError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [currentPage]);

  const filtered: Assessment[] = (data?.assessments ?? []).filter((a) => {
    const matchesSearch = search === "" || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domain === "All Domains"  || a.domain === domain;
    const matchesStatus = status === "All Statuses" || a.status === status;
    return matchesSearch && matchesDomain && matchesStatus;
  });

  const from = (currentPage - 1) * 5 + 1;
  const to   = Math.min(currentPage * 5, data?.total ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        searchPlaceholder="Search assessments..."
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        menuOpen={sidebarOpen}
      />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Breadcrumb items={[{ label: "Management" }, { label: "Assessments" }]} />

          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Assessments Page</h1>
              <p className="mt-1 max-w-xl text-sm text-gray-500">
                Manage academic evaluation cycles. Configure pass parameters, monitor
                status cycles, and deploy new logic tests to candidates.
              </p>
            </div>
            <button
              type="button"
              aria-label="Create assessment"
              className="flex shrink-0 items-center gap-2 rounded-md bg-[#153a75] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0f2a58] focus:outline-none focus:ring-2 focus:ring-[#153a75] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create Assessment
            </button>
          </div>

          {/* Stat cards */}
          {isLoading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AssessmentStatCard
                label="Total Assessments"
                value={data?.total ?? 0}
                subtitle={`+${data?.totalThisMonth ?? 0} this month`}
                subtitleColor="gray"
              />
              <AssessmentStatCard
                label="Active Sessions"
                value={String(data?.activeSessions ?? 0).padStart(3, "0")}
                subtitle="Live Now"
                subtitleColor="green"
              />
              <AssessmentStatCard
                label="Avg. Pass Rate"
                value={data?.avgPassRate ?? "—"}
                subtitle="Stable"
                subtitleColor="blue"
              />
            </div>
          )}

          {loadError && (
            <p className="mt-4 text-sm text-red-500" role="alert">{loadError}</p>
          )}

          {/* Filters + table */}
          <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Search */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Search Registry
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    aria-label="Search assessments"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full rounded-md border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  />
                </div>
              </div>

              {/* Domain filter */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Domain Filter
                </label>
                <div className="relative">
                  <select
                    aria-label="Filter by domain"
                    value={domain}
                    onChange={(e) => { setDomain(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  >
                    {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Status filter */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Status
                </label>
                <div className="relative">
                  <select
                    aria-label="Filter by status"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <>
                <AssessmentsTable assessments={filtered} />

                {/* Pagination */}
                <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-medium text-[#153a75]">{from}-{to}</span>{" "}
                    of{" "}
                    <span className="font-medium text-[#153a75]">{data?.total ?? 0}</span>{" "}
                    assessments
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#153a75] hover:text-[#153a75] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(data?.totalPages ?? 1, p + 1))}
                      disabled={currentPage === (data?.totalPages ?? 1)}
                      className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#153a75] hover:text-[#153a75] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next Page
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* System maintenance banner */}
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">
              i
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">System Maintenance</p>
              <p className="mt-0.5 text-xs text-blue-600">
                The next scheduled database synchronization is at 04:00 UTC. All assessment
                logic will remain available during the update.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
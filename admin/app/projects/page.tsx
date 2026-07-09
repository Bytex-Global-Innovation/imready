"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import ProjectsTable from "../components/ProjectsTable";
import { projectsApi, Project, ProjectsResponse } from "../lib/api";

const DOMAINS = [
  "All Domains",
  "AI_ML",
  "BLOCKCHAIN",
  "CYBER_SEC",
  "CLOUD_COMP",
  "CRYPTOGRAPHY",
];

export default function ProjectsPage() {
  const [data, setData]               = useState<ProjectsResponse | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState("");
  const [domain, setDomain]           = useState("All Domains");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    projectsApi
      .getProjects(currentPage)
      .then((res) => { if (isMounted) setData(res); })
      .catch((err) => { if (isMounted) setLoadError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [currentPage]);

  const filtered: Project[] = (data?.projects ?? []).filter((p) => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domain === "All Domains" || p.domain === domain;
    return matchesSearch && matchesDomain;
  });

  const from = (currentPage - 1) * 5 + 1;
  const to   = Math.min(currentPage * 5, data?.total ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        searchPlaceholder="Search projects..."
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        menuOpen={sidebarOpen}
      />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Industry Projects
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage active industry collaborations and student assignments.
              </p>
            </div>
            <button
              type="button"
              aria-label="Create project"
              className="flex shrink-0 items-center gap-2 rounded-md bg-[#153a75] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0f2a58] focus:outline-none focus:ring-2 focus:ring-[#153a75] focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>

          {loadError && (
            <p className="mt-4 text-sm text-red-500" role="alert">{loadError}</p>
          )}

          {/* Filters + table card */}
          <div className="mt-5 rounded-lg border border-gray-200 bg-white">
            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filter by name or ID..."
                    aria-label="Search projects"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full rounded-md border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Domain
                </label>
                <div className="relative">
                  <select
                    aria-label="Filter by domain"
                    value={domain}
                    onChange={(e) => { setDomain(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <ProjectsTable projects={filtered} />
            )}

            {/* Pagination */}
            {!isLoading && (data?.totalPages ?? 1) > 1 && (
              <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center">
                <p className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-[#153a75]">{from}–{to}</span>{" "}
                  of{" "}
                  <span className="font-medium text-[#153a75]">{data?.total ?? 0}</span>{" "}
                  projects
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
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
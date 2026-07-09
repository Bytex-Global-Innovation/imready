"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Topbar from "@/app/components/Topbar";
import Sidebar from "@/app/components/Sidebar";
import Breadcrumb from "@/app/components/Breadcrumb";
import MentorStatCard from "@/app/components/MentorStatCard";
import MentorsTable from "@/app/components/MentorsTable";
import { mentorsApi, Mentor, MentorsResponse } from "../lib/api";

export default function MentorsPage() {
  const [data, setData]               = useState<MentorsResponse | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    mentorsApi
      .getMentors(currentPage)
      .then((res) => { if (isMounted) setData(res); })
      .catch((err) => { if (isMounted) setLoadError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [currentPage]);

  const filtered: Mentor[] = (data?.mentors ?? []).filter((m) =>
    search === "" ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.mentorId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages  = data?.totalPages ?? 1;
  const totalMentors = data?.totalMentors ?? 0;
  const from = (currentPage - 1) * 4 + 1;
  const to   = Math.min(currentPage * 4, totalMentors);

  // build page numbers — show up to 5 around current
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        menuOpen={sidebarOpen}
      />

      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Breadcrumb items={[{ label: "Registry" }, { label: "Mentors" }]} />

          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Mentors Management
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            Manage mentor assignments, project allocations, and the student teams
            each mentor is guiding across the global education network.
          </p>

          {/* Stat cards */}
          {isLoading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg border border-gray-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MentorStatCard
                label="Total Mentors"
                value={data?.totalMentors ?? 0}
                subtitle=""
                progress={60}
              />
              <MentorStatCard
                label="Active Projects"
                value={data?.activeProjects ?? 0}
                subtitle={`${data?.soloProjects ?? 0} solo · ${data?.teamProjects ?? 0} team-based`}
                progress={75}
              />
              <MentorStatCard
                label="Students Guided"
                value={data?.studentsGuided ?? 0}
                subtitle={`Avg. ${data?.avgStudentsPerMentor ?? "—"} students per mentor`}
                progress={85}
              />
            </div>
          )}

          {loadError && (
            <p className="mt-4 text-sm text-red-500" role="alert">{loadError}</p>
          )}

          {/* Registry panel */}
          <div className="mt-5 rounded-lg border border-gray-200 bg-white">
            {/* Panel header */}
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Mentor Registry</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
                  {totalMentors} Total
                </span>
              </div>

              <div className="relative w-full sm:w-52">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by name or ID..."
                  aria-label="Filter mentors"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-md border border-gray-200 py-1.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75]"
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <MentorsTable mentors={filtered} />
            )}

            {/* Pagination */}
            {!isLoading && (
              <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center">
                <p className="text-xs text-gray-400">
                  Showing {from} to {to} of {totalMentors} mentors
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                        currentPage === n
                          ? "bg-[#153a75] text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
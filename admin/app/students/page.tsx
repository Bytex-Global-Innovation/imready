"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import AdminShell from "../components/AdminShell";
import StudentsTable from "../components/StudentsTable";
import Pagination from "../components/Pagination";
import { studentsApi, Student, StudentsResponse } from "../lib/api";

const COLLEGES = ["All Institutions", "Tech Central Inst.", "Bio Labs Univ.", "Global Arts Acad."];
const DOMAINS  = ["All Domains", "Cyber Security", "Data Science", "UX Architecture", "Quantum Comp"];

export default function StudentsPage() {
  const [data, setData]               = useState<StudentsResponse | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [loadError, setLoadError]     = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState("");
  const [college, setCollege]         = useState("All Institutions");
  const [domain, setDomain]           = useState("All Domains");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    studentsApi
      .getStudents(currentPage)
      .then((res) => { if (isMounted) setData(res); })
      .catch((err) => { if (isMounted) setLoadError(err.message); })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, [currentPage]);

  const filteredStudents: Student[] = (data?.students ?? []).filter((s) => {
    const matchesSearch  = search  === ""                || s.studentName.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchesCollege = college === "All Institutions" || s.college === college;
    const matchesDomain  = domain  === "All Domains"      || s.domain  === domain;
    return matchesSearch && matchesCollege && matchesDomain;
  });

  return (
    <AdminShell
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen((prev) => !prev)}
      onSidebarClose={() => setSidebarOpen(false)}
      searchPlaceholder="Quick search students..."
    >
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Students Registry</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            Central directory for student records, enrollment status, and academic
            domain mapping across all registered collegiate units.
          </p>

          <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
            {/* Filters — stack on mobile, 3 cols on sm+ */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Search Registry
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    aria-label="Search students"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full rounded-md border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  College
                </label>
                <div className="relative">
                  <select
                    aria-label="Filter by college"
                    value={college}
                    onChange={(e) => { setCollege(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none rounded-md border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] sm:py-2"
                  >
                    {COLLEGES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                    {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {loadError && (
              <p className="mb-4 text-sm text-red-500" role="alert">{loadError}</p>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <>
                <StudentsTable students={filteredStudents} />
                <div className="mt-4">
                  <Pagination
                    currentPage={data?.page ?? 1}
                    totalPages={data?.totalPages ?? 1}
                    totalEntries={data?.total ?? 0}
                    pageSize={4}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
    </AdminShell>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import ProjectsTable from "@/components/tables/projects-table";
import { useDataLoader } from "@/hooks/use-data-loader";
import { projectsApi, type Project } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { begin, end } = useDataLoader();

  const loadData = useCallback(async (page: number) => {
    begin();
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getProjects(page);
      setProjects(data.projects);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalEntries(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
      end();
    }
  }, [begin, end]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await projectsApi.deleteProject(deleteId);
      setDeleteId(null);
      await loadData(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Catalog
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Industry Projects
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Create projects with full brief details for the student catalog.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!isLoading ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fb0]" />
                {totalEntries} project{totalEntries === 1 ? "" : "s"}
              </div>
            ) : null}
            <Link
              href="/projects/create"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3b6fb0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2f5f99]"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:px-5">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
            Search
          </label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a94b3]" />
            <input
              type="text"
              placeholder="Search projects by name…"
              className="w-full rounded-xl border border-[#cfe0f5] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15 disabled:cursor-not-allowed disabled:bg-[#f3f7fc] disabled:text-[#9aa3b2]"
              disabled
            />
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <PanelLoader label="Loading projects…" />
        ) : (
          <>
            <ProjectsTable projects={projects} onDelete={(id) => setDeleteId(id)} />
            {totalEntries > 0 ? (
              <div className="border-t border-[#e8eef6] bg-[#f7faff] px-4 py-3 sm:px-5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalEntries={totalEntries}
                  pageSize={10}
                  onPageChange={(page) => loadData(page)}
                  entryLabel="projects"
                />
              </div>
            ) : null}
          </>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete project"
        message="Archive/delete this project? This cannot be undone."
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

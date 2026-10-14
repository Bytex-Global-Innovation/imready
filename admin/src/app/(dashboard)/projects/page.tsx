"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import Pagination from "@/components/ui/pagination";
import ProjectsTable from "@/components/tables/projects-table";
import { projectsApi, type Project } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Industry Projects" },
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

  const loadData = useCallback(async (page: number) => {
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
    }
  }, []);

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
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Industry Projects</h1>
          <p className="admin-page-subtitle">
            Create projects with full brief details for the student catalog.
          </p>
        </div>
        <Link href="/projects/create" className="admin-btn-primary gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      <div className="admin-card">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name..."
              className="admin-input-icon w-full"
              disabled
            />
          </div>
        </div>

        {error && <div className="p-4 text-sm text-red-500">{error}</div>}

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
            Loading projects…
          </div>
        ) : (
          <>
            <ProjectsTable projects={projects} onDelete={(id) => setDeleteId(id)} />
            <div className="p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalEntries={totalEntries}
                pageSize={10}
                onPageChange={(page) => loadData(page)}
                entryLabel="projects"
              />
            </div>
          </>
        )}
      </div>

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
    </>
  );
}

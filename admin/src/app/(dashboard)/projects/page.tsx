"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, Plus } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
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

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Industry Projects</h1>
          <p className="admin-page-subtitle">Monitor ongoing live industry projects and their assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="admin-btn-outline">Export Data</button>
          <button className="admin-btn-primary gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="admin-card">
        {/* Filters/Search Header */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name or mentor..."
              className="admin-input-icon w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="admin-btn-outline gap-2 bg-gray-50/50">
              <span className="text-gray-500">Domain:</span> All
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            <button className="admin-btn-outline gap-2 bg-gray-50/50">
              <span className="text-gray-500">Status:</span> All
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}

        <div className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">Loading projects...</div>
          ) : (
            <ProjectsTable projects={projects} />
          )}
        </div>

        {!isLoading && totalEntries > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={5} // matched to mock API length
              onPageChange={loadData}
              entryLabel="projects"
            />
          </div>
        )}
      </div>
    </>
  );
}

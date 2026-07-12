"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, Plus } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Pagination from "@/components/ui/pagination";
import StudentsTable from "@/components/tables/students-table";
import { studentsApi, type Student } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students Registry" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const loadData = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentsApi.getStudents(page);
      setStudents(data.students);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalEntries(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Students Registry</h1>
          <p className="admin-page-subtitle">Manage and monitor student enrollments and verifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="admin-btn-outline">Export CSV</button>
          <button className="admin-btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add Student
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
              placeholder="Search students..."
              className="admin-input-icon w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="admin-btn-outline gap-2 bg-gray-50/50">
              <span className="text-gray-500">College:</span> All
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
            <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading students...</div>
          ) : (
            <StudentsTable students={students} />
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
              entryLabel="students"
            />
          </div>
        )}
      </div>
    </>
  );
}

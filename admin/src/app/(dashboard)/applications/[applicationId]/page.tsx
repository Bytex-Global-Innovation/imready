"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import { projectsApi, type ProjectApplicationDetail } from "@/lib/api";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-600",
} as const;

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const router = useRouter();
  const applicationId = params.applicationId;

  const [detail, setDetail] = useState<ProjectApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getApplication(applicationId);
      setDetail(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application.");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Applications", href: "/applications" },
    { label: detail?.studentName || "Application" },
  ];

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
        Loading application…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Application not found."}
        </div>
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push("/applications")}
        >
          Back to applications
        </button>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="admin-page-title">{detail.studentName}</h1>
          <p className="admin-page-subtitle">{detail.studentEmail}</p>
          <p className="mt-2 text-sm text-gray-600">
            Applied to {detail.projectTitle}
            {detail.projectCompanyName ? ` · ${detail.projectCompanyName}` : ""}
          </p>
        </div>
        <span className={`admin-badge ${STATUS_STYLES[detail.status]}`}>
          {detail.status.charAt(0) + detail.status.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-stat-card">
          <p className="admin-section-label">Submitted</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {detail.submittedAtLabel || "—"}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-section-label">Project team size</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {detail.projectTeamSizeLabel || `${detail.projectTeamSize} students`}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-section-label">Contributions</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {detail.contributions.length || 0} selected
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-section-label">Student ID</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {detail.studentId || "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-5">
          <h2 className="text-sm font-semibold text-gray-900">Why are you interested?</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {detail.motivation?.trim() || "No motivation provided."}
          </p>
        </div>

        <div className="admin-card p-5">
          <h2 className="text-sm font-semibold text-gray-900">
            I can contribute through
          </h2>
          {detail.contributions.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No contribution areas selected.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {detail.contributions.map((item) => (
                <li
                  key={item}
                  className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 admin-card p-5">
        <h2 className="text-sm font-semibold text-gray-900">Project</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Title</dt>
            <dd className="mt-1 text-sm text-gray-800">{detail.projectTitle}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Company</dt>
            <dd className="mt-1 text-sm text-gray-800">
              {detail.projectCompanyName || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Slug</dt>
            <dd className="mt-1 text-sm text-gray-800">{detail.projectSlug || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Team capacity</dt>
            <dd className="mt-1 text-sm text-gray-800">
              {detail.projectTeamSizeLabel || `${detail.projectTeamSize} students`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push("/applications")}
        >
          Back to applications
        </button>
      </div>
    </>
  );
}

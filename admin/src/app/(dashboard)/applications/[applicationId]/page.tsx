"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import { projectsApi, type ProjectApplicationDetail } from "@/lib/api";

const STATUS_STYLES = {
  PENDING: "bg-[#fff7ed] text-[#c2410c]",
  APPROVED: "bg-[#ecfdf5] text-[#047857]",
  REJECTED: "bg-[#fef2f2] text-[#b91c1c]",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function statusLabel(status: ProjectApplicationDetail["status"]) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

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
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="admin-skeleton h-36 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="admin-skeleton h-40 rounded-2xl" />
          <div className="admin-skeleton h-40 rounded-2xl" />
        </div>
        <div className="admin-skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error || "Application not found."}
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
          onClick={() => router.push("/applications")}
        >
          ← Back to applications
        </button>
      </div>
    );
  }

  const metaCards = [
    {
      label: "Submitted",
      value: detail.submittedAtLabel || "—",
    },
    {
      label: "Team size",
      value:
        detail.projectTeamSizeLabel || `${detail.projectTeamSize} students`,
    },
    {
      label: "Contributions",
      value: `${detail.contributions.length} selected`,
    },
    {
      label: "Student ID",
      value: detail.studentId || "—",
    },
  ];

  const projectFields = [
    { label: "Title", value: detail.projectTitle },
    { label: "Company", value: detail.projectCompanyName || "—" },
    { label: "Slug", value: detail.projectSlug || "—" },
    {
      label: "Team capacity",
      value:
        detail.projectTeamSizeLabel || `${detail.projectTeamSize} students`,
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={breadcrumbs} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(59,111,176,0.8)]">
              {initials(detail.studentName)}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
                Application review
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
                {detail.studentName}
              </h1>
              <p className="mt-1 text-sm text-[#5a7aa0]">{detail.studentEmail}</p>
              <p className="mt-2 text-sm leading-6 text-[#3b6fb0]">
                Applied to{" "}
                <span className="font-semibold text-[#1e4f8c]">
                  {detail.projectTitle}
                </span>
                {detail.projectCompanyName
                  ? ` · ${detail.projectCompanyName}`
                  : ""}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[detail.status]}`}
          >
            {statusLabel(detail.status)}
          </span>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metaCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
              {card.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0b1c30]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
          <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-[#1e4f8c]">
              Why are you interested?
            </h2>
          </div>
          <div className="p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#334155]">
              {detail.motivation?.trim() || "No motivation provided."}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
          <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-[#1e4f8c]">
              I can contribute through
            </h2>
          </div>
          <div className="p-5">
            {detail.contributions.length === 0 ? (
              <p className="text-sm text-[#6b7280]">
                No contribution areas selected.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {detail.contributions.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-semibold text-[#3b6fb0]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[#1e4f8c]">Project</h2>
        </div>
        <dl className="grid gap-4 p-5 sm:grid-cols-2">
          {projectFields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[#e8eef6] bg-[#f7faff] px-4 py-3"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                {field.label}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-[#0b1c30]">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
          onClick={() => router.push("/applications")}
        >
          ← Back to applications
        </button>
      </div>
    </div>
  );
}

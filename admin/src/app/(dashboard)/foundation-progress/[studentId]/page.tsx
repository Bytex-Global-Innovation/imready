"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import FoundationEvidencePreviewModal, {
  type EvidencePreviewTarget,
} from "@/components/ui/foundation-evidence-preview-modal";
import StatCard from "@/components/ui/stat-card";
import { Download, Eye } from "@/components/icons";
import {
  foundationApi,
  resolveMediaUrl,
  type FoundationStudentProgressDetail,
} from "@/lib/api";

export default function FoundationStudentProgressPage() {
  const params = useParams<{ studentId: string }>();
  const [data, setData] = useState<FoundationStudentProgressDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewEvidence, setPreviewEvidence] = useState<EvidencePreviewTarget | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await foundationApi.getStudentProgress(params.studentId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student progress.");
    } finally {
      setIsLoading(false);
    }
  }, [params.studentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Foundation Progress", href: "/foundation-progress" },
    { label: data?.student.studentName ?? "Student" },
  ];

  if (isLoading) {
    return <p className="text-sm text-muted">Loading student progress…</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-red-600">{error ?? "Student not found."}</p>;
  }

  const progressPercent = Math.round(
    (data.progress.completedCount / data.progress.totalMissions) * 100,
  );

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">{data.student.studentName}</h1>
          <p className="text-sm text-muted">{data.student.email}</p>
          <p className="text-sm text-muted">{data.student.collegeName}</p>
        </div>
        <Link href="/foundation-progress" className="admin-btn-outline">
          Back to list
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Missions Completed" value={`${data.progress.completedCount}/${data.progress.totalMissions}`} />
        <StatCard label="Total XP" value={String(data.progress.totalXp)} />
        <StatCard label="Foundation Status" value={data.progress.foundationComplete ? "Complete" : "In Progress"} />
        <StatCard label="Progress" value={`${progressPercent}%`} progress={progressPercent} />
      </div>

      <div className="mt-6 space-y-4">
        {data.missions.map((mission) => (
          <section key={mission.missionId} className="admin-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Mission {mission.missionId}: {mission.label}
              </h2>
              <span
                className={`admin-badge ${
                  mission.completed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {mission.completed ? "COMPLETED" : "IN PROGRESS"}
              </span>
            </div>

            {mission.missionId === 4 &&
            typeof mission.answers.presentationVideoUrl === "string" &&
            mission.answers.presentationVideoUrl.trim() ? (
              <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3">
                <p className="text-sm text-muted">
                  Presentation video:{" "}
                  <span className="font-medium text-foreground break-all">
                    {mission.answers.presentationVideoUrl}
                  </span>
                </p>
                <a
                  href={String(mission.answers.presentationVideoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-3 py-1.5 text-sm font-medium text-[#153a75] hover:bg-surface"
                >
                  <Eye className="h-4 w-4" />
                  Open video
                </a>
              </div>
            ) : null}

            {mission.evidence?.fileName ? (
              <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3">
                <p className="text-sm text-muted">
                  Evidence document:{" "}
                  <span className="font-medium text-foreground">{mission.evidence.fileName}</span>
                </p>
                {mission.evidence.filePath || mission.evidence.fileUrl ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewEvidence({
                          fileName: mission.evidence!.fileName!,
                          filePath: mission.evidence!.filePath,
                          fileUrl: mission.evidence!.fileUrl,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-3 py-1.5 text-sm font-medium text-[#153a75] hover:bg-surface"
                    >
                      <Eye className="h-4 w-4" />
                      View evidence
                    </button>
                    <a
                      href={resolveMediaUrl(mission.evidence.filePath || mission.evidence.fileUrl)}
                      download={mission.evidence.fileName || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-3 py-1.5 text-sm font-medium text-[#153a75] hover:bg-surface"
                    >
                      <Download className="h-4 w-4" />
                      Download evidence
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-amber-700">
                    File metadata saved before upload support — re-upload required from student side.
                  </span>
                )}
              </div>
            ) : null}

            <div className="space-y-3">
              {Object.entries(mission.answers)
                .filter(([key]) => !(mission.missionId === 4 && key === "presentationVideoUrl"))
                .map(([key, value]) => (
                <div key={key} className="rounded-[var(--radius-card)] border border-border bg-surface p-3">
                  <p className="text-xs font-semibold tracking-wider text-muted uppercase">{key}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                  </p>
                </div>
              ))}
              {Object.keys(mission.answers).length === 0 ? (
                <p className="text-sm text-muted">No answers saved yet.</p>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <FoundationEvidencePreviewModal
        open={Boolean(previewEvidence)}
        evidence={previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}

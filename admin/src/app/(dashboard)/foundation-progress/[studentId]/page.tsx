"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import FoundationEvidencePreviewModal, {
  type EvidencePreviewTarget,
} from "@/components/ui/foundation-evidence-preview-modal";
import { Download, Eye } from "@/components/icons";
import {
  foundationApi,
  resolveMediaUrl,
  type FoundationStudentProgressDetail,
} from "@/lib/api";

const VERIFICATION_STYLES = {
  PENDING: "bg-[#fff7ed] text-[#c2410c]",
  PASSED: "bg-[#ecfdf5] text-[#047857]",
  FAILED: "bg-[#fef2f2] text-[#b91c1c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function FoundationStudentProgressPage() {
  const params = useParams<{ studentId: string }>();
  const [data, setData] = useState<FoundationStudentProgressDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewEvidence, setPreviewEvidence] = useState<EvidencePreviewTarget | null>(null);
  const [note, setNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true);
    setError(null);
    try {
      const response = await foundationApi.getStudentProgress(params.studentId);
      setData(response);
      setNote(response.verification?.note || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student progress.");
    } finally {
      if (!options?.silent) setIsLoading(false);
    }
  }, [params.studentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function review(decision: "PASSED" | "FAILED") {
    if (!data) return;
    setIsReviewing(true);
    setReviewError(null);
    setReviewMessage(null);
    try {
      await foundationApi.reviewVerification(data.student.id, decision, note);
      setReviewMessage(
        decision === "PASSED"
          ? `${data.student.studentName} passed Foundation verification.`
          : `${data.student.studentName} was marked as not passed.`,
      );
      await loadData({ silent: true });
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Could not update verification.",
      );
    } finally {
      setIsReviewing(false);
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Foundation Progress", href: "/foundation-progress" },
    { label: data?.student.studentName ?? "Student" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="admin-skeleton h-36 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="admin-skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="admin-skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error ?? "Student not found."}
        </div>
        <Link
          href="/foundation-progress"
          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const progressPercent = Math.round(
    (data.progress.completedCount / data.progress.totalMissions) * 100,
  );
  const verificationStatus = data.verification?.status ?? "NONE";
  const isPending = verificationStatus === "PENDING";

  const metaCards = [
    {
      label: "Missions completed",
      value: `${data.progress.completedCount}/${data.progress.totalMissions}`,
    },
    { label: "Total XP", value: String(data.progress.totalXp) },
    {
      label: "Foundation status",
      value: data.progress.foundationComplete ? "Complete" : "In progress",
    },
    { label: "Progress", value: `${progressPercent}%` },
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
              {initials(data.student.studentName)}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
                Foundation evidence
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
                {data.student.studentName}
              </h1>
              <p className="mt-1 text-sm text-[#5a7aa0]">{data.student.email}</p>
              <p className="mt-1 text-sm text-[#3b6fb0]">
                {data.student.collegeName || "—"}
              </p>
              {data.progress.selectedProblemStatement?.statementText ? (
                <p className="mt-3 max-w-3xl rounded-xl border border-[#cfe0f5] bg-white/70 px-3 py-2 text-sm leading-6 text-[#334155]">
                  <span className="font-semibold text-[#1e4f8c]">
                    Foundation challenge:{" "}
                  </span>
                  {data.progress.selectedProblemStatement.statementText}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${VERIFICATION_STYLES[verificationStatus]}`}
            >
              {statusLabel(verificationStatus)}
            </span>
            <Link
              href="/foundation-progress"
              className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
            >
              Back to list
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metaCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
              {card.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0b1c30]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[#1e4f8c]">
            Foundation verification
          </h2>
          <p className="mt-1 text-xs text-[#7a94b3]">
            Review the evidence below, then pass or mark as not passed.
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#475569]">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${VERIFICATION_STYLES[verificationStatus]}`}
            >
              {statusLabel(verificationStatus)}
            </span>
            {data.verification?.requestedAtLabel ? (
              <span>Requested {data.verification.requestedAtLabel}</span>
            ) : (
              <span>No verification request yet</span>
            )}
          </div>

          {data.verification?.note && !isPending ? (
            <p className="rounded-xl border border-[#e8eef6] bg-[#f7faff] px-4 py-3 text-sm text-[#334155]">
              <span className="font-semibold text-[#1e4f8c]">Review note: </span>
              {data.verification.note}
            </p>
          ) : null}

          {reviewMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {reviewMessage}
            </div>
          ) : null}
          {reviewError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {reviewError}
            </div>
          ) : null}

          {isPending ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
                  Optional review note
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a short note for this decision"
                  className="w-full rounded-xl border border-[#d7e0ef] bg-[#f7faff] px-3 py-2.5 text-sm text-[#0b1c30] outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:bg-white"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void review("PASSED")}
                  className="inline-flex cursor-pointer items-center rounded-full bg-[#3b6fb0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f8c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isReviewing ? "Saving…" : "Pass"}
                </button>
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => void review("FAILED")}
                  className="inline-flex cursor-pointer items-center rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Not passed
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="space-y-4">
        {data.missions.map((mission) => (
          <section
            key={mission.missionId}
            className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[#1e4f8c]">
                Mission {mission.missionId}: {mission.label}
              </h2>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  mission.completed
                    ? "bg-[#ecfdf5] text-[#047857]"
                    : "bg-[#fff7ed] text-[#c2410c]"
                }`}
              >
                {mission.completed ? "Completed" : "In progress"}
              </span>
            </div>

            <div className="space-y-3 p-5">
              {mission.missionId === 5 &&
              typeof mission.answers.presentationVideoUrl === "string" &&
              mission.answers.presentationVideoUrl.trim() ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e8eef6] bg-[#f7faff] px-4 py-3">
                  <p className="text-sm text-[#475569]">
                    Impact video:{" "}
                    <span className="break-all font-medium text-[#0b1c30]">
                      {mission.answers.presentationVideoUrl}
                    </span>
                  </p>
                  <a
                    href={String(mission.answers.presentationVideoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-sm font-medium text-[#3b6fb0] hover:bg-[#eaf3ff]"
                  >
                    <Eye className="h-4 w-4" />
                    Open video
                  </a>
                </div>
              ) : null}

              {mission.evidence?.fileName ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e8eef6] bg-[#f7faff] px-4 py-3">
                  <p className="text-sm text-[#475569]">
                    Evidence document:{" "}
                    <span className="font-medium text-[#0b1c30]">
                      {mission.evidence.fileName}
                    </span>
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
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-sm font-medium text-[#3b6fb0] hover:bg-[#eaf3ff]"
                      >
                        <Eye className="h-4 w-4" />
                        View evidence
                      </button>
                      <a
                        href={resolveMediaUrl(
                          mission.evidence.filePath || mission.evidence.fileUrl,
                        )}
                        download={mission.evidence.fileName || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-sm font-medium text-[#3b6fb0] hover:bg-[#eaf3ff]"
                      >
                        <Download className="h-4 w-4" />
                        Download evidence
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700">
                      File metadata saved before upload support — re-upload required
                      from student side.
                    </span>
                  )}
                </div>
              ) : null}

              <div className="space-y-3">
                {Object.entries(mission.answers)
                  .filter(
                    ([key]) =>
                      !(mission.missionId === 4 && key === "presentationVideoUrl"),
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-[#e8eef6] bg-[#f7faff] p-3"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                        {key}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-[#0b1c30]">
                        {Array.isArray(value) ? value.join(", ") : String(value ?? "—")}
                      </p>
                    </div>
                  ))}
                {Object.keys(mission.answers).length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No answers saved yet.</p>
                ) : null}
              </div>
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

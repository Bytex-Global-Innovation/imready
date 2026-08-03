"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  assessmentsApi,
  type AssessmentResultDetail,
} from "@/lib/api";

export default function AssessmentResultDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const router = useRouter();
  const submissionId = params.submissionId;

  const [detail, setDetail] = useState<AssessmentResultDetail | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await assessmentsApi.getResultDetail(submissionId);
      setDetail(response);
      const next: Record<string, string> = {};
      response.answers.forEach((answer) => {
        next[answer.id] =
          answer.personalScore == null ? "" : String(answer.personalScore);
      });
      setScores(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submission.");
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function savePersonalScore(answerId: string) {
    const raw = scores[answerId];
    const value = Number(raw);
    if (Number.isNaN(value) || value < 0) {
      setError("Enter a valid personal response score.");
      return;
    }
    setSavingId(answerId);
    setError(null);
    setMessage(null);
    try {
      const updated = await assessmentsApi.setPersonalScore(
        submissionId,
        answerId,
        value,
      );
      setDetail(updated);
      setMessage("Personal score saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save score.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleFullEvaluate() {
    setIsEvaluating(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await assessmentsApi.fullEvaluate(submissionId);
      setDetail(updated);
      setMessage(
        updated.result === "PASS"
          ? "Full evaluation complete — student PASSED."
          : "Full evaluation complete — student FAILED.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Full evaluation failed.");
    } finally {
      setIsEvaluating(false);
    }
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Assessment Results", href: "/assessment-results" },
    { label: detail?.studentName || "Evaluate" },
  ];

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
        Loading submission…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Submission not found."}
        </div>
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push("/assessment-results")}
        >
          Back to results
        </button>
      </div>
    );
  }

  const allPersonalScored = detail.answers.every(
    (a) => a.personalMax <= 0 || a.personalScore != null,
  );

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="admin-page-title">{detail.studentName}</h1>
          <p className="admin-page-subtitle">
            {detail.email} · {detail.collegeName}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            {detail.assessment?.name} · Pass at {detail.passMarksValue} / {detail.maxScore}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`admin-badge ${
              detail.result === "PASS"
                ? "bg-emerald-50 text-emerald-700"
                : detail.result === "FAIL"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {detail.result || "PENDING"}
          </span>
          <button
            type="button"
            className="admin-btn-primary gap-2"
            disabled={!allPersonalScored || isEvaluating || detail.status === "EVALUATED"}
            onClick={handleFullEvaluate}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isEvaluating ? "Evaluating…" : "Full Evaluate"}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="admin-stat-card">
          <p className="admin-section-label">Jumbled (auto)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{detail.jumbledScore}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-section-label">Personal (manual)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {detail.personalScore == null ? "—" : detail.personalScore}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-section-label">Total</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {detail.totalScore == null
              ? "—"
              : `${detail.totalScore}/${detail.maxScore}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {detail.answers.map((answer, index) => (
          <section key={answer.id} className="admin-card space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Question {index + 1} · {answer.category} · {answer.answerType}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">{answer.title}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {answer.prompt}{" "}
                <span className="font-semibold text-gray-900">{answer.question}</span>
              </p>
            </div>

            {answer.answerType !== "PERSONAL" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Student order (auto-scored {answer.jumbledScore}/{answer.jumbledMax})
                  </p>
                  <ol className="space-y-1.5">
                    {answer.optionOrder.map((opt, i) => (
                      <li
                        key={opt.id}
                        className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="mr-2 text-xs font-semibold text-gray-400">
                          {i + 1}.
                        </span>
                        {opt.label}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Correct order
                  </p>
                  <ol className="space-y-1.5">
                    {answer.correctOrder.map((opt) => (
                      <li
                        key={opt.id}
                        className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm"
                      >
                        <span className="mr-2 text-xs font-semibold text-emerald-600">
                          {opt.correctOrder}.
                        </span>
                        {opt.label}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {answer.answerType !== "JUMBLED" && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Personal response
                </p>
                <div className="rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {answer.personalResponse || (
                    <span className="text-gray-400">No response provided.</span>
                  )}
                </div>
              </div>
            )}

            {answer.personalMax > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block text-sm sm:w-48">
                  <span className="mb-1 block font-medium text-gray-700">
                    Personal score (max {answer.personalMax})
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={answer.personalMax}
                    step={0.5}
                    className="admin-input w-full"
                    value={scores[answer.id] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [answer.id]: e.target.value }))
                    }
                    disabled={detail.status === "EVALUATED"}
                  />
                </label>
                <button
                  type="button"
                  className="admin-btn-outline"
                  disabled={savingId === answer.id || detail.status === "EVALUATED"}
                  onClick={() => savePersonalScore(answer.id)}
                >
                  {savingId === answer.id ? "Saving…" : "Save score"}
                </button>
              </div>
            )}
            {answer.personalMax <= 0 && (
              <p className="text-xs text-gray-500">
                No personal response scoring required for this question.
              </p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

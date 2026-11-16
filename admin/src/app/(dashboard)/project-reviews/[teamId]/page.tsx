"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  projectsApi,
  type OwnerContinuation,
  type OwnerFeedbackInput,
  type Stage2ReviewPacket,
} from "@/lib/api";

const CONTINUATION_OPTIONS: {
  value: OwnerContinuation;
  title: string;
  description: string;
}[] = [
  {
    value: "entire_team",
    title: "Continue with the entire team",
    description: "Invite all active members into Stage 3 Paid Industry Engagement.",
  },
  {
    value: "selected_students",
    title: "Continue with selected students",
    description: "Select specific role standouts based on contributions.",
  },
  {
    value: "no_continuation",
    title: "No continuation at this time",
    description: "Project concludes with Stage 2 verification & credential delivery.",
  },
];

const DEFAULT_FORM: OwnerFeedbackInput = {
  workedWell: "",
  improved: "",
  valuable: "",
  overall: "",
  studentQuote:
    "Your second iteration showed significant improvement. Excellent user research and clear evidence of impact.",
  rating: 5,
  continuation: "entire_team",
  valuedPoints: [
    "Strong user understanding",
    "Evidence-based approach",
    "Clear improvement in Iteration 2",
    "Well structured final demo",
  ],
  improvePoints: [
    "Consider edge cases",
    "Test with a slightly larger user group",
    "Explore long-term engagement metrics",
  ],
  selectedStudentIds: [],
};

export default function ProjectReviewDetailPage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const teamId = params.teamId;

  const [packet, setPacket] = useState<Stage2ReviewPacket | null>(null);
  const [form, setForm] = useState<OwnerFeedbackInput>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getReview(teamId);
      setPacket(response);
      const fb = response.ownerFeedback;
      setForm({
        workedWell: fb?.workedWell || "",
        improved: fb?.improved || "",
        valuable: fb?.valuable || "",
        overall: fb?.overall || "",
        studentQuote: fb?.studentQuote || DEFAULT_FORM.studentQuote,
        rating: fb?.rating || 5,
        continuation: fb?.continuation || "entire_team",
        valuedPoints: fb?.valuedPoints?.length
          ? fb.valuedPoints
          : DEFAULT_FORM.valuedPoints,
        improvePoints: fb?.improvePoints?.length
          ? fb.improvePoints
          : DEFAULT_FORM.improvePoints,
        selectedStudentIds:
          fb?.selectedStudentIds?.length
            ? fb.selectedStudentIds
            : response.members.filter((m) => m.isLead).map((m) => m.studentId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review packet.");
      setPacket(null);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void load();
  }, [load]);

  const breadcrumbs = useMemo(
    () => [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Stage 2 Reviews", href: "/project-reviews" },
      { label: packet?.teamName || "Owner Feedback" },
    ],
    [packet?.teamName],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const toggleStudent = (studentId: string) => {
    setForm((prev) => {
      const set = new Set(prev.selectedStudentIds || []);
      if (set.has(studentId)) set.delete(studentId);
      else set.add(studentId);
      return { ...prev, selectedStudentIds: [...set] };
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await projectsApi.saveOwnerFeedback(teamId, form);
      setPacket(updated);
      showToast("Draft saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await projectsApi.submitOwnerFeedback(teamId, form);
      setPacket(updated);
      showToast("Feedback submitted — visible to students");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
        Loading owner feedback…
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Review packet not found."}
        </div>
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push("/project-reviews")}
        >
          Back to reviews
        </button>
      </div>
    );
  }

  const feedbackSubmitted = packet.ownerFeedback?.status === "SUBMITTED";

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#153a75] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              Owner Portal · Screen 25
            </span>
            <span className="text-xs font-medium text-gray-500">
              Stage 2 · Board C Review → Outcome
            </span>
          </div>
          <h1 className="admin-page-title">Owner Feedback</h1>
          <p className="admin-page-subtitle">
            {packet.projectTitle}
            {packet.projectCompanyName ? ` – ${packet.projectCompanyName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-badge bg-blue-50 text-blue-700">
            Submission: {packet.submissionStatus}
          </span>
          <span
            className={`admin-badge ${
              feedbackSubmitted
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            Feedback: {packet.feedbackStatus}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="admin-card p-5">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Your Feedback</h2>
                <p className="text-xs text-gray-500">Rubric guided · published to students</p>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {packet.submission?.submissionCode || "No submission code"}
              </span>
            </div>

            <div className="space-y-4">
              <Field
                label="1. What worked well?"
                value={form.workedWell || ""}
                onChange={(v) => setForm((p) => ({ ...p, workedWell: v }))}
                rows={3}
              />
              <Field
                label="2. What could be improved?"
                value={form.improved || ""}
                onChange={(v) => setForm((p) => ({ ...p, improved: v }))}
                rows={3}
              />
              <Field
                label="3. What did you find valuable?"
                value={form.valuable || ""}
                onChange={(v) => setForm((p) => ({ ...p, valuable: v }))}
                rows={3}
              />
              <Field
                label="4. Overall feedback"
                value={form.overall || ""}
                onChange={(v) => setForm((p) => ({ ...p, overall: v }))}
                rows={3}
              />
              <Field
                label="Student-facing highlight quote"
                value={form.studentQuote || ""}
                onChange={(v) => setForm((p) => ({ ...p, studentQuote: v }))}
                rows={2}
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Rating (1–5)
                </label>
                <select
                  className="admin-input w-32"
                  value={form.rating || 5}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rating: Number(e.target.value) }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  Continue with this project?
                </h3>
                <div className="space-y-2">
                  {CONTINUATION_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                        form.continuation === option.value
                          ? "border-[#153a75] bg-[#eff4ff]"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        name="continuation"
                        checked={form.continuation === option.value}
                        onChange={() =>
                          setForm((p) => ({ ...p, continuation: option.value }))
                        }
                      />
                      <span>
                        <span className="block text-sm font-semibold text-gray-900">
                          {option.title}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {form.continuation === "selected_students" ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Select students
                  </p>
                  <div className="space-y-2">
                    {packet.members.map((member) => {
                      const checked = (form.selectedStudentIds || []).includes(
                        member.studentId,
                      );
                      return (
                        <label
                          key={member.studentId}
                          className="flex items-center gap-2 text-sm text-gray-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudent(member.studentId)}
                          />
                          <span>
                            {member.studentName}
                            {member.isLead ? " · Lead" : ""}
                            <span className="text-gray-400"> · {member.studentEmail}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="button"
                  className="admin-btn-outline"
                  disabled={saving || submitting}
                  onClick={() => void handleSaveDraft()}
                >
                  {saving ? "Saving…" : "Save draft"}
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  disabled={saving || submitting}
                  onClick={() => void handleSubmit()}
                >
                  {submitting
                    ? "Submitting…"
                    : feedbackSubmitted
                      ? "Update & republish feedback →"
                      : "Submit Feedback →"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="admin-card p-5">
            <h2 className="text-sm font-semibold text-gray-900">Team</h2>
            <p className="mt-1 text-xs text-gray-500">{packet.teamName}</p>
            <ul className="mt-3 space-y-2">
              {packet.members.map((m) => (
                <li
                  key={m.studentId}
                  className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-gray-900">
                    {m.studentName}
                    {m.isLead ? " · Lead" : ""}
                  </div>
                  <div className="text-xs text-gray-500">{m.studentEmail}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-card p-5">
            <h2 className="text-sm font-semibold text-gray-900">Submission snapshot</h2>
            {packet.submission ? (
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Status:</span> {packet.submission.status}
                </p>
                <p>
                  <span className="font-semibold">Code:</span>{" "}
                  {packet.submission.submissionCode || "—"}
                </p>
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
                  {packet.submission.summary || "No summary provided."}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-amber-700">
                Team has not submitted yet. You can still draft feedback, but students will
                only see it after you submit.
              </p>
            )}
          </div>

          <div className="admin-card p-5">
            <h2 className="text-sm font-semibold text-gray-900">Student preview</h2>
            <p className="mt-2 text-xs text-gray-500">
              After submit, the student Feedback Received card (Screen 26) shows the overall
              quote, valued/improve chips, and continuation outcome.
            </p>
            {feedbackSubmitted ? (
              <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                Live for students on /owner-feedback and /outcome
              </p>
            ) : (
              <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
                Not published yet
              </p>
            )}
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#002546] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
      <textarea
        className="admin-input min-h-[80px] w-full"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

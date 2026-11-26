"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/ui/breadcrumb";
import { TagListField } from "@/components/ui/easy-list-fields";
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

const fieldLabel =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a7aa0]";
const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3.5 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

const SUBMISSION_STYLES: Record<string, string> = {
  SUBMITTED: "bg-[#eaf3ff] text-[#3b6fb0]",
  DRAFT: "bg-[#fff7ed] text-[#c2410c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
};

const FEEDBACK_STYLES: Record<string, string> = {
  SUBMITTED: "bg-[#ecfdf5] text-[#047857]",
  DRAFT: "bg-[#fff7ed] text-[#c2410c]",
  NONE: "bg-[#f1f5f9] text-[#64748b]",
};

function statusText(value: string) {
  if (!value) return "—";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

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
        selectedStudentIds: fb?.selectedStudentIds?.length
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
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="admin-skeleton h-36 rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="admin-skeleton h-[28rem] rounded-2xl lg:col-span-8" />
          <div className="space-y-4 lg:col-span-4">
            <div className="admin-skeleton h-40 rounded-2xl" />
            <div className="admin-skeleton h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="space-y-5">
        <Breadcrumb items={breadcrumbs} />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error || "Review packet not found."}
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
          onClick={() => router.push("/project-reviews")}
        >
          ← Back to reviews
        </button>
      </div>
    );
  }

  const feedbackSubmitted = packet.ownerFeedback?.status === "SUBMITTED";

  return (
    <div className="space-y-5">
      <Breadcrumb items={breadcrumbs} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#3b6fb0] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                Owner portal
              </span>
              <span className="text-xs font-medium text-[#7a94b3]">
                Stage 2 · Board C Review → Outcome
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Owner Feedback
            </h1>
            <p className="mt-1 text-sm text-[#5a7aa0]">
              {packet.projectTitle}
              {packet.projectCompanyName ? ` · ${packet.projectCompanyName}` : ""}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3b6fb0]">
              {packet.teamName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                SUBMISSION_STYLES[packet.submissionStatus] || SUBMISSION_STYLES.NONE
              }`}
            >
              Submission: {statusText(packet.submissionStatus)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                FEEDBACK_STYLES[packet.feedbackStatus] || FEEDBACK_STYLES.NONE
              }`}
            >
              Feedback: {statusText(packet.feedbackStatus)}
            </span>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
              onClick={() => router.push("/project-reviews")}
            >
              Back to reviews
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-[#1e4f8c]">Your feedback</h2>
                <p className="mt-0.5 text-xs text-[#7a94b3]">
                  Rubric guided · published to students
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5a7aa0] ring-1 ring-[#cfe0f5]">
                {packet.submission?.submissionCode || "No submission code"}
              </span>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="1. What worked well?"
                  value={form.workedWell || ""}
                  onChange={(v) => setForm((p) => ({ ...p, workedWell: v }))}
                  rows={4}
                  placeholder="Strengths you saw in the team’s work…"
                />
                <Field
                  label="2. What could be improved?"
                  value={form.improved || ""}
                  onChange={(v) => setForm((p) => ({ ...p, improved: v }))}
                  rows={4}
                  placeholder="Concrete improvement areas…"
                />
                <Field
                  label="3. What did you find valuable?"
                  value={form.valuable || ""}
                  onChange={(v) => setForm((p) => ({ ...p, valuable: v }))}
                  rows={4}
                  placeholder="Insights that stood out…"
                />
                <Field
                  label="4. Overall feedback"
                  value={form.overall || ""}
                  onChange={(v) => setForm((p) => ({ ...p, overall: v }))}
                  rows={4}
                  placeholder="Summary for the team…"
                />
              </div>

              <Field
                label="Student-facing highlight quote"
                value={form.studentQuote || ""}
                onChange={(v) => setForm((p) => ({ ...p, studentQuote: v }))}
                rows={2}
                placeholder="Short quote shown on the student feedback card…"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TagListField
                  label="Valued points (chips)"
                  hint="Shown as chips on the student Feedback Received card."
                  values={form.valuedPoints || []}
                  onChange={(next) => setForm((p) => ({ ...p, valuedPoints: next }))}
                  placeholder="Add a valued point"
                />
                <TagListField
                  label="Improve points (chips)"
                  hint="Shown as chips for what to improve next."
                  values={form.improvePoints || []}
                  onChange={(next) => setForm((p) => ({ ...p, improvePoints: next }))}
                  placeholder="Add an improve point"
                />
              </div>

              <div>
                <span className={fieldLabel}>Rating</span>
                <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#cfe0f5] bg-[#f7faff] p-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const selected = (form.rating || 5) === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, rating: n }))}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? "bg-[#3b6fb0] text-white"
                            : "text-[#5a7aa0] hover:bg-white hover:text-[#1e4f8c]"
                        }`}
                      >
                        {n} ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#e8eef6] bg-[#f7faff] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e4f8c]">
                    Continue with this project?
                  </h3>
                  <p className="mt-0.5 text-xs text-[#7a94b3]">
                    Chooses the Stage 3 outcome shown to students.
                  </p>
                </div>
                <div className="space-y-2">
                  {CONTINUATION_OPTIONS.map((option) => {
                    const selected = form.continuation === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                          selected
                            ? "border-[#3b6fb0] bg-white shadow-sm"
                            : "border-[#d7e0ef] bg-white hover:border-[#cfe0f5] hover:bg-[#eaf3ff]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1"
                          name="continuation"
                          checked={selected}
                          onChange={() =>
                            setForm((p) => ({ ...p, continuation: option.value }))
                          }
                        />
                        <span>
                          <span className="block text-sm font-semibold text-[#0b1c30]">
                            {option.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#6b7280]">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {form.continuation === "selected_students" ? (
                  <div className="rounded-xl border border-[#cfe0f5] bg-white p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
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
                            className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#e8eef6] bg-[#f7faff] px-3 py-2 text-sm text-[#0b1c30]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStudent(member.studentId)}
                              className="h-4 w-4 rounded border-[#cfe0f5] text-[#3b6fb0] focus:ring-[#3b6fb0]/30"
                            />
                            <span>
                              {member.studentName}
                              {member.isLead ? " · Lead" : ""}
                              <span className="text-[#7a94b3]">
                                {" "}
                                · {member.studentEmail}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#e8eef6] bg-[#f7faff] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving || submitting}
                onClick={() => void handleSaveDraft()}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={saving || submitting}
                onClick={() => void handleSubmit()}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#3b6fb0] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f8c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting…"
                  : feedbackSubmitted
                    ? "Update & republish feedback →"
                    : "Submit feedback →"}
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
            <div className="border-b border-[#e8eef6] bg-[#f7faff] px-4 py-3">
              <h2 className="text-sm font-semibold text-[#1e4f8c]">Team</h2>
              <p className="mt-0.5 text-xs text-[#7a94b3]">{packet.teamName}</p>
            </div>
            <ul className="space-y-2 p-4">
              {packet.members.map((m) => (
                <li
                  key={m.studentId}
                  className="flex items-start gap-3 rounded-xl border border-[#e8eef6] bg-[#f7faff] px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3b6fb0] text-[11px] font-semibold text-white">
                    {initials(m.studentName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0b1c30]">
                      {m.studentName}
                      {m.isLead ? (
                        <span className="ml-1.5 rounded-full bg-[#eaf3ff] px-2 py-0.5 text-[10px] font-semibold text-[#3b6fb0]">
                          Lead
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-[#6b7280]">{m.studentEmail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
            <div className="border-b border-[#e8eef6] bg-[#f7faff] px-4 py-3">
              <h2 className="text-sm font-semibold text-[#1e4f8c]">
                Submission snapshot
              </h2>
            </div>
            <div className="space-y-3 p-4">
              {packet.submission ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        SUBMISSION_STYLES[packet.submission.status] ||
                        SUBMISSION_STYLES.NONE
                      }`}
                    >
                      {statusText(packet.submission.status)}
                    </span>
                    <span className="inline-flex rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748b]">
                      {packet.submission.submissionCode || "—"}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#475569]">
                    {packet.submission.summary || "No summary provided."}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#c2410c]">
                  Team has not submitted yet. You can still draft feedback; students
                  see it only after you submit.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
            <div className="border-b border-[#e8eef6] bg-[#f7faff] px-4 py-3">
              <h2 className="text-sm font-semibold text-[#1e4f8c]">Student preview</h2>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-xs leading-5 text-[#6b7280]">
                After submit, students see the highlight quote, valued/improve chips,
                and continuation outcome on their Feedback Received card.
              </p>
              {feedbackSubmitted ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Live for students on /owner-feedback and /outcome
                </p>
              ) : (
                <p className="rounded-xl border border-[#e8eef6] bg-[#f7faff] px-3 py-2 text-xs font-medium text-[#7a94b3]">
                  Not published yet
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1e4f8c] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={fieldLabel}>{label}</span>
      <textarea
        className={`${fieldControl} min-h-[88px] resize-y`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

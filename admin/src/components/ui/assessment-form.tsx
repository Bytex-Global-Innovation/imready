"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import AddQuestionModal, {
  type DraftQuestion,
} from "@/components/ui/add-question-modal";
import {
  assessmentsApi,
  type AnswerType,
  type AssessmentQuestionBankItem,
  type AssessmentQuestionInput,
  type AssessmentStatus,
  type CreateAssessmentPayload,
  type QuestionOrderMode,
  type WeightingMode,
} from "@/lib/api";

type AssessmentFormMode = "create" | "edit";

interface AssessmentFormProps {
  mode: AssessmentFormMode;
  assessmentId?: string;
}

function needsJumbled(answerType: AnswerType) {
  return answerType === "JUMBLED" || answerType === "BOTH";
}

function needsPersonal(answerType: AnswerType) {
  return answerType === "PERSONAL" || answerType === "BOTH";
}

function answerTypeLabel(answerType: AnswerType) {
  if (answerType === "JUMBLED") return "Jumbled only";
  if (answerType === "PERSONAL") return "Personal only";
  return "Jumbled + personal";
}

function toQuestionPayload(draft: DraftQuestion): AssessmentQuestionInput {
  return {
    title: draft.title.trim(),
    prompt: "",
    question: draft.question.trim(),
    tips: [],
    answerType: draft.answerType,
    options: needsJumbled(draft.answerType)
      ? draft.options.map((opt, index) => ({
          label: opt.label.trim(),
          correctOrder: index + 1,
        }))
      : [],
    category: draft.category,
    jumbledOptionsMarks: needsJumbled(draft.answerType)
      ? draft.jumbledOptionsMarks
      : 0,
    personalResponseMarks: needsPersonal(draft.answerType)
      ? draft.personalResponseMarks
      : 0,
  };
}

function questionKey(title: string, question: string) {
  return `${title.trim().toLowerCase()}::${question.trim().toLowerCase()}`;
}

function bankItemToDraft(item: AssessmentQuestionBankItem): DraftQuestion {
  const answerType = item.answerType ?? "BOTH";
  const sorted = [...(item.options || [])].sort((a, b) => a.correctOrder - b.correctOrder);
  const options = needsJumbled(answerType)
    ? [0, 1, 2, 3].map((index) => ({
        label: sorted[index]?.label || "",
        correctOrder: index + 1,
      }))
    : [];
  return {
    title: item.title,
    prompt: "",
    question: item.question,
    tipsText: "",
    answerType,
    options,
    sourceId: item.id,
    category: item.category ?? "OBSERVATION",
    jumbledOptionsMarks: item.jumbledOptionsMarks ?? undefined,
    personalResponseMarks: item.personalResponseMarks ?? undefined,
  };
}

export default function AssessmentForm({ mode, assessmentId }: AssessmentFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [domain] = useState("General");
  const [status, setStatus] = useState<AssessmentStatus>("DRAFT");
  const [questionCount, setQuestionCount] = useState(1);
  const [questionOrderMode, setQuestionOrderMode] =
    useState<QuestionOrderMode>("sequential");
  const [jumbledOptionsMarks, setJumbledOptionsMarks] = useState(60);
  const [personalResponseMarks, setPersonalResponseMarks] = useState(40);
  const [weightingMode, setWeightingMode] = useState<WeightingMode>("EQUAL");
  const [passMarks, setPassMarks] = useState(70);
  const [newQuestions, setNewQuestions] = useState<DraftQuestion[]>([]);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Assessments", href: "/assessments" },
    { label: isEdit ? "Update Assessment" : "Create Assessment" },
  ];

  useEffect(() => {
    if (!isEdit || !assessmentId) return;

    let cancelled = false;
    async function loadAssessment() {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await assessmentsApi.getAssessment(assessmentId!);
        if (cancelled) return;
        setName(detail.name);
        setStatus(detail.status);
        setQuestionCount(detail.questionCount ?? 1);
        setQuestionOrderMode(detail.questionOrderMode ?? "sequential");
        setJumbledOptionsMarks(detail.jumbledOptionsMarks ?? 60);
        setPersonalResponseMarks(detail.personalResponseMarks ?? 40);
        setWeightingMode(detail.weightingMode ?? "EQUAL");
        setPassMarks(detail.passMarksValue ?? 70);
        setNewQuestions((detail.questions || []).map(bankItemToDraft));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assessment.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAssessment();
    return () => {
      cancelled = true;
    };
  }, [isEdit, assessmentId]);

  const totalSelected = newQuestions.length;
  const estimatedTotal =
    weightingMode === "EQUAL"
      ? newQuestions.slice(0, questionCount).reduce((sum, q) => {
          const jumbled = needsJumbled(q.answerType) ? jumbledOptionsMarks : 0;
          const personal = needsPersonal(q.answerType) ? personalResponseMarks : 0;
          return sum + jumbled + personal;
        }, 0)
      : newQuestions.slice(0, questionCount).reduce((sum, q) => {
          const jumbled = needsJumbled(q.answerType) ? (q.jumbledOptionsMarks ?? 0) : 0;
          const personal = needsPersonal(q.answerType) ? (q.personalResponseMarks ?? 0) : 0;
          return sum + jumbled + personal;
        }, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (totalSelected < 1) {
      setError("Add at least one question.");
      return;
    }
    if (questionCount > totalSelected) {
      setError("Questions to ask cannot exceed added questions.");
      return;
    }

    const uniqueDrafts: DraftQuestion[] = [];
    const seenKeys = new Set<string>();
    for (const draft of newQuestions) {
      const key = questionKey(draft.title, draft.question);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      uniqueDrafts.push(draft);
    }

    for (const draft of uniqueDrafts) {
      if (!draft.title.trim() || !draft.question.trim()) {
        setError("Fill in title and question text for every question.");
        return;
      }
      if (needsJumbled(draft.answerType)) {
        if (draft.options.length !== 4 || draft.options.some((o) => !o.label.trim())) {
          setError("Every jumbled/combined question must have exactly 4 options.");
          return;
        }
      }
    }

    const payload: CreateAssessmentPayload = {
      name: name.trim(),
      domain,
      status,
      questionCount,
      questionOrderMode,
      jumbledOptionsMarks,
      personalResponseMarks,
      weightingMode,
      passMarks,
      questionIds: [],
      questions: uniqueDrafts.map(toQuestionPayload),
    };

    setIsSubmitting(true);
    try {
      if (isEdit && assessmentId) {
        await assessmentsApi.updateAssessment(assessmentId, payload);
      } else {
        await assessmentsApi.createAssessment(payload);
      }
      router.push("/assessments");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update assessment."
            : "Failed to create assessment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
        Loading assessment…
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">
            {isEdit ? "Update Assessment" : "Create Assessment"}
          </h1>
          <p className="admin-page-subtitle">
            {isEdit
              ? "Edit assessment details, questions, and evaluation criteria."
              : "Add questions with ordered options, choose what to ask, and set evaluation criteria."}
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-outline"
          onClick={() => router.push("/assessments")}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="admin-card space-y-4 p-5">
          <p className="admin-section-label">Assessment details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Name</span>
              <input
                className="admin-input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={255}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Status</span>
              <select
                className="admin-input w-full cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssessmentStatus)}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Question order for students
              </span>
              <select
                className="admin-input w-full cursor-pointer"
                value={questionOrderMode}
                onChange={(e) =>
                  setQuestionOrderMode(e.target.value as QuestionOrderMode)
                }
              >
                <option value="sequential">Sequential</option>
                <option value="random">Random</option>
                <option value="jumbled">Jumbled</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                How many questions to ask
              </span>
              <input
                type="number"
                min={1}
                max={Math.max(1, totalSelected || 50)}
                className="admin-input w-full"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value) || 1)}
                required
              />
            </label>
          </div>
        </section>

        <section className="admin-card space-y-4 p-5">
          <p className="admin-section-label">Evaluation criteria</p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Weighting method</span>
            <select className="admin-input w-full" value={weightingMode} onChange={(e) => setWeightingMode(e.target.value as WeightingMode)}>
              <option value="EQUAL">Same weight for every question</option>
              <option value="INDIVIDUAL">Individual weight per question</option>
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Marks for jumbled options
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="admin-input w-full"
                value={jumbledOptionsMarks}
                onChange={(e) => setJumbledOptionsMarks(Number(e.target.value) || 0)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Marks for personal response
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="admin-input w-full"
                value={personalResponseMarks}
                onChange={(e) =>
                  setPersonalResponseMarks(Number(e.target.value) || 0)
                }
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Pass marks (absolute)
              </span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="admin-input w-full"
                value={passMarks}
                onChange={(e) => setPassMarks(Number(e.target.value) || 0)}
                required
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Estimated max score: {estimatedTotal} across {questionCount}{" "}
            {questionCount === 1 ? "question" : "questions"} (varies by answer format).
            Students pass when total score ≥ {passMarks}.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="admin-section-label">Questions for this assessment</p>
            <button
              type="button"
              className="admin-btn-outline gap-2"
              onClick={() => setQuestionModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add new question
            </button>
          </div>

          {newQuestions.length === 0 ? (
            <div className="admin-card p-5 text-sm text-gray-400">
              No questions added yet. Click “Add new question” to open the modal.
            </div>
          ) : (
            newQuestions.map((draft, index) => (
              <div
                key={`${questionKey(draft.title, draft.question)}-${index}`}
                className="admin-card space-y-3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      Question {index + 1}: {draft.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{draft.question}</p>
                    <p className="mt-1 text-xs font-semibold tracking-wide text-primary">
                      {draft.category} · {answerTypeLabel(draft.answerType)}
                    </p>
                    {weightingMode === "INDIVIDUAL" && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {needsJumbled(draft.answerType) && (
                          <label className="text-xs text-gray-600">Jumbled marks
                            <input type="number" min={0} step={0.5} className="admin-input mt-1 w-full" value={draft.jumbledOptionsMarks ?? 0} onChange={(e) => setNewQuestions((prev) => prev.map((q, i) => i === index ? { ...q, jumbledOptionsMarks: Number(e.target.value) || 0 } : q))} />
                          </label>
                        )}
                        {needsPersonal(draft.answerType) && (
                          <label className="text-xs text-gray-600">Personal-response marks
                            <input type="number" min={0} step={0.5} className="admin-input mt-1 w-full" value={draft.personalResponseMarks ?? 0} onChange={(e) => setNewQuestions((prev) => prev.map((q, i) => i === index ? { ...q, personalResponseMarks: Number(e.target.value) || 0 } : q))} />
                          </label>
                        )}
                      </div>
                    )}
                    {needsJumbled(draft.answerType) && (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-500">
                        {draft.options.map((opt, oi) => (
                          <li key={oi}>{opt.label}</li>
                        ))}
                      </ol>
                    )}
                    {draft.answerType === "PERSONAL" && (
                      <p className="mt-2 text-xs text-gray-500">
                        Students will only write a personal response for this question.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label="Remove question"
                    onClick={() =>
                      setNewQuestions((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => router.push("/assessments")}
          >
            Cancel
          </button>
          <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Updating…"
                : "Creating…"
              : isEdit
                ? "Update Assessment"
                : "Create Assessment"}
          </button>
        </div>
      </form>

      <AddQuestionModal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        onSave={(question) => {
          const key = questionKey(question.title, question.question);
          setNewQuestions((prev) => {
            if (prev.some((q) => questionKey(q.title, q.question) === key)) {
              setError("This question is already added to the assessment.");
              return prev;
            }
            setError(null);
            return [...prev, question];
          });
        }}
      />
    </>
  );
}

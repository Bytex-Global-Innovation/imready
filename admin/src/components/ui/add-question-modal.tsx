"use client";

import { useEffect, useId, useState } from "react";
import { X } from "@/components/icons";
import type { AnswerType, QuestionCategory } from "@/lib/api";

export type DraftOption = { label: string; correctOrder: number };

export type DraftQuestion = {
  title: string;
  prompt: string;
  question: string;
  tipsText: string;
  answerType: AnswerType;
  options: DraftOption[];
  sourceId?: number;
  category: QuestionCategory;
  jumbledOptionsMarks?: number;
  personalResponseMarks?: number;
};

function emptyOptions(): DraftOption[] {
  return [
    { label: "", correctOrder: 1 },
    { label: "", correctOrder: 2 },
    { label: "", correctOrder: 3 },
    { label: "", correctOrder: 4 },
  ];
}

export function emptyQuestion(): DraftQuestion {
  return {
    title: "",
    prompt: "",
    question: "",
    tipsText: "",
    answerType: "BOTH",
    category: "OBSERVATION",
    options: emptyOptions(),
  };
}

function needsJumbled(answerType: AnswerType) {
  return answerType === "JUMBLED" || answerType === "BOTH";
}

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (question: DraftQuestion) => void;
}

export default function AddQuestionModal({
  open,
  onClose,
  onSave,
}: AddQuestionModalProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<DraftQuestion>(emptyQuestion());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(emptyQuestion());
    setError(null);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function updateOption(index: number, label: string) {
    setDraft((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, label } : opt,
      ),
    }));
  }

  function setAnswerType(answerType: AnswerType) {
    setDraft((prev) => ({
      ...prev,
      answerType,
      options: needsJumbled(answerType)
        ? prev.options.length === 4
          ? prev.options
          : emptyOptions()
        : [],
    }));
  }

  function handleSave() {
    if (!draft.title.trim() || !draft.question.trim()) {
      setError("Title and question are required.");
      return;
    }
    if (needsJumbled(draft.answerType)) {
      if (draft.options.length !== 4 || draft.options.some((o) => !o.label.trim())) {
        setError("Exactly 4 options are required, each with a label.");
        return;
      }
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      prompt: "",
      question: draft.question.trim(),
      options: needsJumbled(draft.answerType)
        ? draft.options.map((opt, index) => ({
            label: opt.label.trim(),
            correctOrder: index + 1,
          }))
        : [],
    });
    onClose();
  }

  const showOptions = needsJumbled(draft.answerType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close add question modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Add new question
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose the answer format students will complete for this question.
            </p>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Title</span>
            <input
              className="admin-input w-full"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Core Competency: Community Impact"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Answer format</span>
            <select
              className="admin-input w-full"
              value={draft.answerType}
              onChange={(e) => setAnswerType(e.target.value as AnswerType)}
            >
              <option value="JUMBLED">Jumbled order only</option>
              <option value="PERSONAL">Personal response only</option>
              <option value="BOTH">Jumbled order + personal response</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Evaluation category</span>
            <select className="admin-input w-full" value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value as QuestionCategory }))}>
              <option value="OBSERVATION">Observation</option>
              <option value="THINKING">Thinking</option>
              <option value="BUILDING">Building</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Question</span>
            <textarea
              className="admin-input w-full"
              rows={3}
              value={draft.question}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, question: e.target.value }))
              }
            />
          </label>

          {showOptions && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Options in correct order (fixed 4)
              </p>
              <ul className="space-y-2">
                {draft.options.map((opt, oi) => (
                  <li key={oi} className="flex items-center gap-2">
                    <span className="w-6 shrink-0 text-xs font-semibold text-gray-400">
                      {oi + 1}.
                    </span>
                    <input
                      className="admin-input w-full"
                      value={opt.label}
                      onChange={(e) => updateOption(oi, e.target.value)}
                      placeholder={`Correct step ${oi + 1}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="admin-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="admin-btn-primary" onClick={handleSave}>
            Add question
          </button>
        </div>
      </div>
    </div>
  );
}

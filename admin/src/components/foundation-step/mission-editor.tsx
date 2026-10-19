"use client";

import { Plus } from "@/components/icons";
import type { FoundationStepMissionConfig, FoundationStepQuestion } from "@/lib/api";
import MissionQuestionCard from "./mission-question-card";

const MISSION_TABS = [1, 2, 3, 4, 5] as const;

interface MissionEditorProps {
  problemTitle: string;
  activeMission: number;
  onMissionChange: (missionId: number) => void;
  draft: FoundationStepMissionConfig;
  onDraftChange: (next: FoundationStepMissionConfig) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function MissionEditor({
  problemTitle,
  activeMission,
  onMissionChange,
  draft,
  onDraftChange,
  onSave,
  isSaving,
}: MissionEditorProps) {
  function patchDraft(patch: Partial<FoundationStepMissionConfig>) {
    onDraftChange({ ...draft, ...patch });
  }

  function updateQuestion(index: number, patch: Partial<FoundationStepQuestion>) {
    const next = [...draft.questions];
    next[index] = { ...next[index], ...patch };
    onDraftChange({ ...draft, questions: next });
  }

  function addQuestion() {
    onDraftChange({
      ...draft,
      questions: [
        ...draft.questions,
        {
          answerKey: `field_${draft.questions.length + 1}`,
          question: "",
          helper: "",
          placeholder: "",
        },
      ],
    });
  }

  function removeQuestion(index: number) {
    onDraftChange({
      ...draft,
      questions: draft.questions.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#f8fafc] to-white px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Editing problem
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">{problemTitle}</p>
      </div>

      <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Mission">
          {MISSION_TABS.map((id) => {
            const selected = activeMission === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onMissionChange(id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-[#153a75] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Mission {id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Tip from READY</h3>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,200px)_1fr]">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Badge label</span>
              <input
                className="admin-input w-full"
                value={draft.tipAdvisorLabel}
                onChange={(e) => patchDraft({ tipAdvisorLabel: e.target.value })}
              />
            </label>
            <label className="block text-sm sm:col-span-1">
              <span className="mb-1 block font-medium text-gray-700">Quote</span>
              <textarea
                className="admin-input min-h-[88px] w-full resize-y"
                value={draft.tipQuote}
                onChange={(e) => patchDraft({ tipQuote: e.target.value })}
              />
            </label>
          </div>
        </section>

        {activeMission === 4 ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-950">
            <p className="font-medium">Mission 4 — presentation video</p>
            <p className="mt-1 text-xs leading-relaxed text-blue-900/90">
              Students paste a YouTube or Google Drive link using the{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                presentationVideoUrl
              </code>{" "}
              field (no file upload).
            </p>
          </div>
        ) : null}

        {activeMission === 3 ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Mission 3 context</h3>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Analyze context (observed problem statement)
              </span>
              <textarea
                className="admin-input min-h-[80px] w-full resize-y"
                value={draft.analyzeContextText ?? ""}
                onChange={(e) => patchDraft({ analyzeContextText: e.target.value })}
              />
            </label>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Questions &amp; placeholders</h3>
              <p className="text-xs text-gray-500">
                {draft.questions.length} field{draft.questions.length === 1 ? "" : "s"} for this
                mission
              </p>
            </div>
            <button type="button" className="admin-btn-outline gap-1.5 px-3 py-1.5 text-xs" onClick={addQuestion}>
              <Plus className="h-3.5 w-3.5" />
              Add field
            </button>
          </div>

          <div className="space-y-3">
            {draft.questions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                No fields yet. Add one to define what students answer in this mission.
              </p>
            ) : (
              draft.questions.map((q, index) => (
                <MissionQuestionCard
                  key={`m${draft.missionId}-q-${index}`}
                  index={index}
                  question={q}
                  onChange={updateQuestion}
                  onRemove={removeQuestion}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-4 sm:px-6">
        <button
          type="button"
          className="admin-btn-primary w-full sm:w-auto"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : `Save Mission ${activeMission}`}
        </button>
      </div>
    </div>
  );
}

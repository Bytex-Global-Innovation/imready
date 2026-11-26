"use client";

import { Plus, X } from "@/components/icons";
import { TagListField } from "@/components/ui/easy-list-fields";
import type { FoundationStepMissionConfig, FoundationStepQuestion } from "@/lib/api";
import MissionQuestionCard from "./mission-question-card";
import MissionSectionFields from "./mission-section-fields";

const MISSION_TABS = [1, 2, 3, 4, 5] as const;

const fieldLabel =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a7aa0]";
const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3.5 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

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

  function updateWhyLayer(index: number, patch: { key?: string; label?: string }) {
    const layers = [...(draft.whyLayerLabels ?? [])];
    layers[index] = { ...layers[index], ...patch };
    patchDraft({ whyLayerLabels: layers });
  }

  function addWhyLayer() {
    const layers = [...(draft.whyLayerLabels ?? [])];
    layers.push({ key: `layer_${layers.length + 1}`, label: "" });
    patchDraft({ whyLayerLabels: layers });
  }

  function removeWhyLayer(index: number) {
    const layers = (draft.whyLayerLabels ?? []).filter((_, i) => i !== index);
    patchDraft({ whyLayerLabels: layers.length ? layers : null });
  }

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
      <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a94b3]">
          Editing problem
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#0b1c30]">
          {problemTitle}
        </p>
      </div>

      <div className="border-b border-[#e8eef6] bg-white px-4 py-3 sm:px-6">
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#cfe0f5] bg-[#f7faff] p-1"
          role="tablist"
          aria-label="Mission"
        >
          {MISSION_TABS.map((id) => {
            const selected = activeMission === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onMissionChange(id)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  selected
                    ? "bg-[#3b6fb0] text-white"
                    : "text-[#5a7aa0] hover:bg-white hover:text-[#1e4f8c]"
                }`}
              >
                Mission {id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        <section className="space-y-3 rounded-2xl border border-[#e8eef6] bg-[#f7faff] p-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1e4f8c]">Tip from READY</h3>
            <p className="mt-0.5 text-xs text-[#7a94b3]">
              Short advisor badge + quote shown at the top of this mission.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,180px)_1fr]">
            <label className="block">
              <span className={fieldLabel}>Badge label</span>
              <input
                className={fieldControl}
                value={draft.tipAdvisorLabel}
                onChange={(e) => patchDraft({ tipAdvisorLabel: e.target.value })}
                placeholder="Advisor"
              />
            </label>
            <label className="block">
              <span className={fieldLabel}>Quote</span>
              <textarea
                className={`${fieldControl} min-h-[88px] resize-y`}
                value={draft.tipQuote}
                onChange={(e) => patchDraft({ tipQuote: e.target.value })}
                placeholder="Guidance students see for this mission…"
              />
            </label>
          </div>
        </section>

        {activeMission <= 3 ? (
          <p className="rounded-xl border border-[#e8eef6] bg-white px-4 py-3 text-xs leading-5 text-[#7a94b3]">
            Missions 1–3 collect written answers only. Evidence upload and video
            links are configured on Mission 5.
          </p>
        ) : null}

        {activeMission === 4 ? (
          <div className="rounded-xl border border-[#cfe0f5] bg-[#eaf3ff] px-4 py-3 text-sm text-[#1e4f8c]">
            <p className="font-semibold">Mission 4 — presentation video</p>
            <p className="mt-1 text-xs leading-relaxed text-[#3b6fb0]">
              Students paste a YouTube or Google Drive link using the{" "}
              <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                presentationVideoUrl
              </code>{" "}
              field (no file upload).
            </p>
          </div>
        ) : null}

        <MissionSectionFields draft={draft} onDraftChange={onDraftChange} />

        {activeMission === 3 ? (
          <section className="space-y-3 rounded-2xl border border-[#e8eef6] bg-[#f7faff] p-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1e4f8c]">
                Mission 3 context
              </h3>
              <p className="mt-0.5 text-xs text-[#7a94b3]">
                Observed problem text, pattern tags, and why-layer labels.
              </p>
            </div>
            <label className="block">
              <span className={fieldLabel}>Analyze context</span>
              <textarea
                className={`${fieldControl} min-h-[80px] resize-y`}
                value={draft.analyzeContextText ?? ""}
                onChange={(e) => patchDraft({ analyzeContextText: e.target.value })}
                placeholder="Observed problem statement shown during analysis…"
              />
            </label>

            <TagListField
              label="Pattern tags"
              hint="Students pick from these tags. Type and press Add or Enter."
              values={draft.patternTagOptions ?? []}
              onChange={(next) =>
                patchDraft({ patternTagOptions: next.length ? next : null })
              }
              placeholder="e.g. Queueing, Bottleneck"
            />

            <div>
              <span className={fieldLabel}>Why layers</span>
              <div className="space-y-2 rounded-xl border border-[#cfe0f5] bg-white p-3">
                {(draft.whyLayerLabels ?? []).length === 0 ? (
                  <p className="text-xs text-[#7a94b3]">No why layers yet.</p>
                ) : null}
                {(draft.whyLayerLabels ?? []).map((layer, index) => (
                  <div
                    key={`why-${index}`}
                    className="grid gap-2 rounded-xl border border-[#e8eef6] bg-[#f7faff] p-3 sm:grid-cols-[140px_1fr_auto]"
                  >
                    <label className="block text-sm">
                      <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                        Key
                      </span>
                      <input
                        className={`${fieldControl} font-mono text-xs`}
                        value={layer.key}
                        onChange={(e) =>
                          updateWhyLayer(index, { key: e.target.value })
                        }
                        placeholder="surface"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block text-[11px] font-medium text-[#7a94b3]">
                        Label
                      </span>
                      <input
                        className={fieldControl}
                        value={layer.label}
                        onChange={(e) =>
                          updateWhyLayer(index, { label: e.target.value })
                        }
                        placeholder="What students see"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-[#cfe0f5] bg-white px-3 py-2.5 text-sm font-semibold text-[#1e4f8c] hover:bg-[#eaf3ff] sm:w-auto"
                        onClick={() => removeWhyLayer(index)}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#cfe0f5] bg-white px-3 py-2 text-sm font-semibold text-[#1e4f8c] hover:bg-[#eaf3ff]"
                  onClick={addWhyLayer}
                >
                  <Plus className="h-4 w-4" />
                  Add why layer
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#1e4f8c]">
                Questions &amp; placeholders
              </h3>
              <p className="mt-0.5 text-xs text-[#7a94b3]">
                {draft.questions.length} field
                {draft.questions.length === 1 ? "" : "s"} for this mission
              </p>
            </div>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#cfe0f5] bg-white px-3 py-1.5 text-xs font-semibold text-[#3b6fb0] transition-colors hover:bg-[#eaf3ff]"
              onClick={addQuestion}
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </button>
          </div>

          <div className="space-y-3">
            {draft.questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#cfe0f5] bg-[#f7faff] px-4 py-8 text-center">
                <p className="text-sm font-medium text-[#0b1c30]">No fields yet</p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Add one to define what students answer in this mission.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3b6fb0] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e4f8c]"
                  onClick={addQuestion}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add first field
                </button>
              </div>
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

      <div className="border-t border-[#e8eef6] bg-[#f7faff] px-4 py-4 sm:px-6">
        <button
          type="button"
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[#3b6fb0] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f8c] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : `Save Mission ${activeMission}`}
        </button>
      </div>
    </div>
  );
}

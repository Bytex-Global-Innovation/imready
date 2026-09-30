"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Flag } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft, toEvidenceMeta } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  EvidenceCapture,
  isAllowedEvidenceFileName,
  MissionBreadcrumb,
  MissionFooterNav,
  MissionLayout,
  MissionProgressPanel,
  TaskChecklist,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";

const MISSION_ID = 3;
const mission = getMission(MISSION_ID);

const PROBLEM_STATEMENT =
  '"Students keep crowding the counter and asking canteen staff repeatedly if their order is ready."';

const WHY_LAYERS = [
  { label: "Why: First Layer (Symptom)", key: "why1" },
  { label: "Why: Second Layer", key: "why2" },
  { label: "Why: Third Layer", key: "why3" },
  { label: "Why: Fourth Layer (Operational)", key: "why4" },
];

const PATTERN_TAG_OPTIONS = ["Information Gap", "Counter Congestion", "Communication Flow"];

export function Mission3Analyze() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [whys, setWhys] = useState<Record<string, string>>({});
  const [rootCause, setRootCause] = useState("");
  const [pattern, setPattern] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setWhys({
        why1: (record.answers.why1 as string) ?? "",
        why2: (record.answers.why2 as string) ?? "",
        why3: (record.answers.why3 as string) ?? "",
        why4: (record.answers.why4 as string) ?? "",
      });
      setRootCause((record.answers.rootCause as string) ?? "");
      setPattern((record.answers.pattern as string) ?? "");
      setTags((record.answers.tags as string[]) ?? []);
      if (isAllowedEvidenceFileName(record.evidence?.fileName)) {
        setEvidence({
          fileName: record.evidence!.fileName,
          filePath: record.evidence?.filePath ?? null,
          previewUrl: null,
        });
      }
      setHydrated(true);
    });
  }, []);

  async function persist() {
    await saveMissionDraft(
      MISSION_ID,
      { ...whys, rootCause, pattern, tags },
      toEvidenceMeta(evidence),
    );
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const whysFilled = WHY_LAYERS.every((layer) => (whys[layer.key] ?? "").trim().length > 0);
  const checklist = [
    { label: "Review your observations", caption: "Reviewed interviews with 3 students & 2 staff.", done: whysFilled },
    { label: "Find recurring patterns", caption: "Noticed constant verbal checks from waiting customers.", done: pattern.trim().length > 0 },
    { label: "Upload synthesis document", caption: "Document with analysis notes and Drive links", done: Boolean(evidence.filePath) },
    { label: "Identify the real root problem", caption: "Completed all 5 layers with confirmed root cause.", done: rootCause.trim().length > 0 },
  ];
  const canComplete =
    whysFilled && rootCause.trim().length > 0 && pattern.trim().length > 0 && Boolean(evidence.filePath);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const answers = { ...whys, rootCause, pattern, tags };
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, answers, evidenceMeta);
      await completeMission(MISSION_ID, answers, evidenceMeta);
      router.push(ROUTES.missionComplete(MISSION_ID));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Stage 0: Foundation" current="Mission 3: Analyze" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Step 3 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      headerRight={<MissionProgressPanel label="Stage Progress" stepLabel="60% Complete" percent={60} />}
      main={
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">Analyze with a Tool: The 5 Whys Framework</h2>
              <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary">
                Diagnostic Mode
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              A simple diagnostic framework to look beyond symptoms and discover the actual root cause.
            </p>

            <div className="mt-5 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase">Observed Problem Statement</p>
              <p className="mt-1 text-sm font-medium text-amber-900">{PROBLEM_STATEMENT}</p>
            </div>

            <ol className="mt-5">
              {WHY_LAYERS.map((layer) => {
                const filled = (whys[layer.key] ?? "").trim().length > 0;
                return (
                  <li key={layer.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          filled ? "bg-emerald-500 text-white" : "bg-brand-100 text-muted"
                        }`}
                      >
                        {filled ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 pb-4">
                      <p className="text-xs font-semibold tracking-wider text-muted uppercase">{layer.label}</p>
                      <input
                        type="text"
                        value={whys[layer.key] ?? ""}
                        onChange={(event) => setWhys((prev) => ({ ...prev, [layer.key]: event.target.value }))}
                        placeholder="Because..."
                        className="mt-1 w-full rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </li>
                );
              })}
              <li className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Flag className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 rounded-[var(--radius-card)] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">
                      Root Cause
                    </span>
                    <span className="text-xs font-medium text-emerald-700">Validated 5th Depth</span>
                    {rootCause.trim() ? <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" /> : null}
                  </div>
                  <input
                    type="text"
                    value={rootCause}
                    onChange={(event) => setRootCause(event.target.value)}
                    placeholder="State the actionable root cause..."
                    className="mt-2 w-full rounded-[var(--radius-card)] border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-2 text-xs text-emerald-700">Ready for prototyping in Mission 4 (Build, Test &amp; Improve)</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">Evidence Synthesis &amp; Pattern Confirmation</h2>
              <span className="shrink-0 text-xs font-semibold tracking-wider whitespace-nowrap text-muted uppercase">
                Step 2 of 2
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Upload a document summarizing your analysis. Include Google Drive links to supporting notes or recordings.
            </p>
            <div className="mt-4">
              <EvidenceCapture missionId={MISSION_ID} value={evidence} onChange={setEvidence} />
            </div>
            <p className="mt-6 text-sm font-medium text-foreground">
              What fundamental pattern did you detect from student quotes and canteen observations?
            </p>
            <textarea
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {PATTERN_TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    tags.includes(tag) ? "border-primary bg-surface text-primary" : "border-border bg-white text-muted hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <MissionFooterNav
              onPrevious={() => router.push(ROUTES.mission(2))}
              onSaveDraft={persist}
              onNext={handleComplete}
              nextLabel="Next: Complete Mission 3"
              nextDisabled={!canComplete}
              isSubmitting={isSubmitting}
            />
          </div>
        </>
      }
      sidebar={
        <>
          <TipFromReady advisorLabel={mission.tip.advisorLabel} quote={mission.tip.quote} />
          <TaskChecklist items={checklist} />
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">5 Whys Reference Guide</p>
            <p className="mb-3 text-xs text-muted">How to ensure your Whys are diagnostic rather than circular:</p>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Test in reverse</dt>
                <dd className="text-xs text-muted">&ldquo;Therefore...&rdquo;</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Target systemic causes</dt>
                <dd className="text-xs text-muted">Avoid personal blame</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Keep it actionable</dt>
                <dd className="text-xs text-muted">Can we prototype a fix?</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-muted">Framework</span>
              <span className="text-right font-medium text-foreground">5 Whys (Toyota Origin)</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-muted">Estimated Time</span>
              <span className="text-right font-medium text-foreground">{mission.estTime}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-muted">Output For Next Stage</span>
              <span className="text-right font-medium text-foreground">1 Prototype Brief</span>
            </div>
          </div>
        </>
      }
    />
  );
}
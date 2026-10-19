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
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import {
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";

const MISSION_ID = 3;
const mission = getMission(MISSION_ID);

const FALLBACK_WHY_LAYERS = [
  { label: "Why: First Layer (Symptom)", key: "why1" },
  { label: "Why: Second Layer", key: "why2" },
  { label: "Why: Third Layer", key: "why3" },
  { label: "Why: Fourth Layer (Operational)", key: "why4" },
];

const FALLBACK_PATTERN_TAGS = ["Information Gap", "Counter Congestion", "Communication Flow"];

export function Mission3Analyze() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [whys, setWhys] = useState<Record<string, string>>({});
  const [rootCause, setRootCause] = useState("");
  const [pattern, setPattern] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const whysFilled = (journeyConfig?.whyLayerLabels ?? FALLBACK_WHY_LAYERS).every(
    (layer) => (whys[layer.key] ?? "").trim().length > 0,
  );
  const canComplete =
    whysFilled && rootCause.trim().length > 0 && pattern.trim().length > 0 && Boolean(evidence.filePath);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { ...whys, rootCause, pattern, tags };
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, answers, evidenceMeta);
      await completeMission(MISSION_ID, answers, evidenceMeta);
      router.push(ROUTES.missionComplete(MISSION_ID));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit this mission. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hydrated || !journeyReady) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  const problemStatement =
    journeyConfig?.analyzeContextText ??
    '"Students keep crowding the counter and asking canteen staff repeatedly if their order is ready."';
  const whyLayers = journeyConfig?.whyLayerLabels ?? FALLBACK_WHY_LAYERS;
  const patternTagOptions = journeyConfig?.patternTagOptions ?? FALLBACK_PATTERN_TAGS;
  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;

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
              <p className="mt-1 text-sm font-medium text-amber-900">{problemStatement}</p>
            </div>

            <ol className="mt-5">
              {whyLayers.map((layer) => {
                const filled = (whys[layer.key] ?? "").trim().length > 0;
                return (
                  <li key={layer.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          filled ? "bg-primary text-white" : "bg-brand-100 text-muted"
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
                        placeholder={questionPlaceholder(journeyConfig, layer.key, "Because...")}
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
                <div className="min-w-0 flex-1 rounded-[var(--radius-card)] border border-primary bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                      Root Cause
                    </span>
                    <span className="text-xs font-medium text-primary">Validated 5th Depth</span>
                    {rootCause.trim() ? <Check className="ml-auto h-4 w-4 shrink-0 text-primary" /> : null}
                  </div>
                  <input
                    type="text"
                    value={rootCause}
                    onChange={(event) => setRootCause(event.target.value)}
                    placeholder={questionPlaceholder(
                      journeyConfig,
                      "rootCause",
                      "State the actionable root cause...",
                    )}
                    className="mt-2 w-full rounded-[var(--radius-card)] border border-primary bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-2 text-xs text-primary">Ready for prototyping in Mission 4 (Build, Test &amp; Improve)</p>
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
              {questionText(
                journeyConfig,
                "pattern",
                "What fundamental pattern did you detect from your observations?",
              )}
            </p>
            <textarea
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              rows={3}
              placeholder={questionPlaceholder(journeyConfig, "pattern")}
              className="mt-2 w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {patternTagOptions.map((tag) => (
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

            {submitError ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

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
          <TipFromReady advisorLabel={tipAdvisor} quote={tipQuote} />
          <ReadyQuestMap currentMission={MISSION_ID} />
        </>
      }
    />
  );
}
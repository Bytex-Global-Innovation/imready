"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Flag } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import { MissionFooterNav } from "./mission-ui";
import { FoundationMissionShell } from "./foundation-mission-shell";
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
  { label: "Why: Fourth Layer", key: "why4" },
];

const OBJECTIVE_STEPS = [
  "Identify the problem clearly from your earlier observations.",
  "Ask why to find the immediate reason behind the problem.",
  "Repeat why on each answer to go deeper.",
  "Name the actionable root cause.",
  "Confirm the pattern you see across conversations.",
];

export function Mission3Analyze() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [whys, setWhys] = useState<Record<string, string>>({});
  const [rootCause, setRootCause] = useState("");
  const [pattern, setPattern] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      setIsSubmitted(Boolean(record.completed));
      setHydrated(true);
    });
  }, []);

  const whyLayers = journeyConfig?.whyLayerLabels ?? FALLBACK_WHY_LAYERS;
  const whysFilled = whyLayers.every((layer) => (whys[layer.key] ?? "").trim().length > 0);
  const canComplete =
    whysFilled && rootCause.trim().length > 0 && pattern.trim().length > 0;
  const locked = isSubmitted;

  async function handleSubmit() {
    if (!canComplete || isSubmitting || locked) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { ...whys, rootCause, pattern };
      await saveMissionDraft(MISSION_ID, answers, null);
      await completeMission(MISSION_ID, answers, null);
      setIsSubmitted(true);
      router.push(ROUTES.missionComplete(MISSION_ID));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit this objective. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hydrated || !journeyReady) {
    return <div className="py-12 text-center text-sm text-muted">Loading objective…</div>;
  }

  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;

  return (
    <FoundationMissionShell
      current="Analyze"
      missionId={MISSION_ID}
      title={mission.title}
      subtitle={mission.subtitle}
      mainTitle="The 5 Whys Framework"
      mainSubtitle="Look beyond symptoms and discover the actual root cause."
      howToSubtitle="Connect the dots. The first answer is rarely the real root cause."
      howToSteps={OBJECTIVE_STEPS}
      tipAdvisor={tipAdvisor}
      tipQuote={tipQuote}
      main={
        <>
          <ol>
            {whyLayers.map((layer) => {
              const filled = (whys[layer.key] ?? "").trim().length > 0;
              return (
                <li key={layer.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        filled ? "bg-primary text-white" : "bg-brand-100 text-muted"
                      }`}
                    >
                      {filled ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 pb-3">
                    <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                      {layer.label}
                    </p>
                    <input
                      type="text"
                      value={whys[layer.key] ?? ""}
                      onChange={(event) =>
                        setWhys((prev) => ({ ...prev, [layer.key]: event.target.value }))
                      }
                      placeholder={questionPlaceholder(journeyConfig, layer.key, "Because...")}
                      disabled={locked}
                      readOnly={locked}
                      className="mt-1 w-full rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
                    />
                  </div>
                </li>
              );
            })}
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Flag className="h-3 w-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1 rounded-[var(--radius-card)] border border-primary bg-surface p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                    Root Cause
                  </span>
                  <span className="text-[11px] font-medium text-primary">Validated 5th Depth</span>
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
                  disabled={locked}
                  readOnly={locked}
                  className="mt-2 w-full rounded-[var(--radius-card)] border border-primary bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-80"
                />
              </div>
            </li>
          </ol>

          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground">
              {questionText(
                journeyConfig,
                "pattern",
                "What fundamental pattern did you detect from your observations?",
              )}
            </p>
            <textarea
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              rows={2}
              placeholder={questionPlaceholder(journeyConfig, "pattern")}
              disabled={locked}
              readOnly={locked}
              className="mt-1.5 w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
            />
          </div>

          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
        </>
      }
      footer={
        <MissionFooterNav
          flush
          onPrevious={() => router.push(ROUTES.mission(2))}
          previousLabel="Back to Engage"
          onSubmit={handleSubmit}
          submitDisabled={!canComplete}
          isSubmitting={isSubmitting}
          isSubmitted={locked}
          onNext={locked ? () => router.push(ROUTES.mission(4)) : undefined}
          nextLabel="Next: Do"
        />
      }
    />
  );
}

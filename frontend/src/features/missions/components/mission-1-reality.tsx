"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { Input } from "@/components/ui/input";
import {
  completeMission,
  ensureFoundationProgress,
  getMissionRecord,
  saveMissionDraft,
} from "../lib/mission-progress";
import { MissionFooterNav } from "./mission-ui";
import { FoundationMissionShell } from "./foundation-mission-shell";
import {
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";

const MISSION_ID = 1;
const mission = getMission(MISSION_ID);

const OBJECTIVE_STEPS = [
  "Observe your surroundings — college, home, shops, or public places.",
  "Identify one moment of frustration, waiting, confusion, or repeated effort.",
  "Understand who is facing the problem and what they are trying to do.",
  "Document what happened and why it is a problem.",
  "Submit your observation — don't jump to solutions yet.",
];

export function Mission1Reality() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setCaption((record.answers.caption as string) ?? "");
      setReflection((record.answers.reflection as string) ?? "");
      setIsSubmitted(Boolean(record.completed));
      setHydrated(true);
    });
  }, []);

  const canComplete = caption.trim().length > 0 && reflection.trim().length > 0;
  const locked = isSubmitted;

  async function handleSubmit() {
    if (!canComplete || isSubmitting || locked) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await saveMissionDraft(MISSION_ID, { caption, reflection }, null);
      await completeMission(MISSION_ID, { caption, reflection }, null);
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
      current="Reality"
      missionId={MISSION_ID}
      title={mission.title}
      subtitle={mission.subtitle}
      mainTitle="Capture what you noticed"
      mainSubtitle="Record the friction moment, then reflect on what stood out."
      howToSubtitle="Identify the problem first. Don't jump to solutions yet."
      howToSteps={OBJECTIVE_STEPS}
      tipAdvisor={tipAdvisor}
      tipQuote={tipQuote}
      main={
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
              {questionText(journeyConfig, "caption", "Short title / caption")}
            </label>
            <Input
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="e.g. Long lunch queue at the canteen"
              disabled={locked}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
              Reflect on what you noticed
            </label>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={4}
              placeholder={questionPlaceholder(
                journeyConfig,
                "reflection",
                "Type your observation here...",
              )}
              disabled={locked}
              readOnly={locked}
              className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
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
          onPrevious={() => router.push(ROUTES.dashboard)}
          previousLabel="Back to Dashboard"
          onSubmit={handleSubmit}
          submitDisabled={!canComplete}
          isSubmitting={isSubmitting}
          isSubmitted={locked}
          onNext={locked ? () => router.push(ROUTES.mission(2)) : undefined}
          nextLabel="Next: Engage"
        />
      }
    />
  );
}

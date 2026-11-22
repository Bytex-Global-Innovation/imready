"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import { MissionFooterNav, QuestionField } from "./mission-ui";
import { FoundationMissionShell } from "./foundation-mission-shell";
import {
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";

const MISSION_ID = 2;
const mission = getMission(MISSION_ID);

const OBJECTIVE_STEPS = [
  "Identify people who experience the problem from Objective 1.",
  "Start a conversation about their experiences.",
  "Ask open-ended questions about challenges and frustrations.",
  "Listen carefully — no assumptions, no solutions yet.",
  "Capture key responses and takeaways.",
];

export function Mission2Engage() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [observation, setObservation] = useState("");
  const [surprise, setSurprise] = useState("");
  const [quotes, setQuotes] = useState("");
  const [patterns, setPatterns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setObservation((record.answers.observation as string) ?? "");
      setSurprise((record.answers.surprise as string) ?? "");
      setQuotes((record.answers.quotes as string) ?? "");
      setPatterns((record.answers.patterns as string) ?? "");
      setIsSubmitted(Boolean(record.completed));
      setHydrated(true);
    });
  }, []);

  const canComplete =
    observation.trim().length > 0 &&
    surprise.trim().length > 0 &&
    quotes.trim().length > 0 &&
    patterns.trim().length > 0;
  const locked = isSubmitted;

  async function handleSubmit() {
    if (!canComplete || isSubmitting || locked) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { observation, surprise, quotes, patterns };
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
      current="Engage"
      missionId={MISSION_ID}
      title={mission.title}
      subtitle={mission.subtitle}
      mainTitle="Capture what you learned"
      mainSubtitle="Record the conversation, then note surprises, quotes, and patterns."
      howToSubtitle="Talk less, listen more — understand the problem through real experiences."
      howToSteps={OBJECTIVE_STEPS}
      tipAdvisor={tipAdvisor}
      tipQuote={tipQuote}
      main={
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
              {questionText(journeyConfig, "observation", "Field observation")}
            </label>
            <textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              rows={2}
              placeholder={questionPlaceholder(journeyConfig, "observation")}
              disabled={locked}
              readOnly={locked}
              className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
            />
          </div>

          <div className="grid gap-3">
            <QuestionField
              index={1}
              compact
              question={questionText(
                journeyConfig,
                "surprise",
                "What surprised you the most during this interaction?",
              )}
              placeholder={questionPlaceholder(journeyConfig, "surprise")}
              value={surprise}
              onChange={setSurprise}
              done={surprise.trim().length > 0}
              disabled={locked}
            />
            <QuestionField
              index={2}
              compact
              question={questionText(
                journeyConfig,
                "quotes",
                "Any direct quotes that capture their frustration or mindset?",
              )}
              placeholder={questionPlaceholder(journeyConfig, "quotes")}
              value={quotes}
              onChange={setQuotes}
              done={quotes.trim().length > 0}
              disabled={locked}
            />
            <QuestionField
              index={3}
              compact
              question={questionText(
                journeyConfig,
                "patterns",
                "What repeating patterns do you see across multiple conversations?",
              )}
              placeholder={questionPlaceholder(journeyConfig, "patterns")}
              value={patterns}
              onChange={setPatterns}
              done={patterns.trim().length > 0}
              disabled={locked}
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
          onPrevious={() => router.push(ROUTES.mission(1))}
          previousLabel="Back to Reality"
          onSubmit={handleSubmit}
          submitDisabled={!canComplete}
          isSubmitting={isSubmitting}
          isSubmitted={locked}
          onNext={locked ? () => router.push(ROUTES.mission(3)) : undefined}
          nextLabel="Next: Analyze"
        />
      }
    />
  );
}

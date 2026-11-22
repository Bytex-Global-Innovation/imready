"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import {
  completeMission,
  ensureFoundationProgress,
  getMissionRecord,
  saveMissionDraft,
} from "../lib/mission-progress";
import { MissionFooterNav, QuestionField } from "./mission-ui";
import { FoundationMissionShell } from "./foundation-mission-shell";
import {
  evidenceConfigText,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";

const MISSION_ID = 4;
const mission = getMission(MISSION_ID);

const OBJECTIVE_STEPS = [
  "Build a small, fast, testable prototype.",
  "Test it with 2–3 real users on location.",
  "Observe what worked and what didn't.",
  "Decide one improvement to make next.",
  "Plan how you will implement that improvement.",
];

export function Mission4Do() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [respond, setRespond] = useState("");
  const [worked, setWorked] = useState("");
  const [didntWork, setDidntWork] = useState("");
  const [improve, setImprove] = useState("");
  const [implementation, setImplementation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setDescription((record.answers.description as string) ?? "");
      setRespond((record.answers.respond as string) ?? "");
      setWorked((record.answers.worked as string) ?? "");
      setDidntWork((record.answers.didntWork as string) ?? "");
      setImprove((record.answers.improve as string) ?? "");
      setImplementation((record.answers.implementation as string) ?? "");
      setIsSubmitted(Boolean(record.completed));
      setHydrated(true);
    });
  }, []);

  function buildAnswers() {
    return {
      description,
      respond,
      worked,
      didntWork,
      improve,
      implementation,
    };
  }

  const canComplete =
    description.trim().length > 0 &&
    respond.trim().length > 0 &&
    worked.trim().length > 0 &&
    didntWork.trim().length > 0 &&
    improve.trim().length > 0 &&
    implementation.trim().length > 0;
  const locked = isSubmitted;

  async function handleSubmit() {
    if (!canComplete || isSubmitting || locked) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = buildAnswers();
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
  const pageSubtitle =
    evidenceConfigText(journeyConfig, "pageSubtitle", mission.subtitle) ?? mission.subtitle;

  return (
    <FoundationMissionShell
      current="Do"
      missionId={MISSION_ID}
      title={mission.title}
      subtitle={pageSubtitle}
      mainTitle="Build, test, and improve"
      mainSubtitle="Keep it small, fast, and testable — then capture what happened."
      howToSubtitle="Don't build a full app. Test one small idea quickly."
      howToSteps={OBJECTIVE_STEPS}
      tipAdvisor={tipAdvisor}
      tipQuote={tipQuote}
      main={
        <>
          <div>
            <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
              {questionText(journeyConfig, "description", "Describe your prototype")}
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder={questionPlaceholder(
                journeyConfig,
                "description",
                "We tried a simple token board at the counter...",
              )}
              disabled={locked}
              readOnly={locked}
              className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
            />
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground">Test reflection</p>
            <QuestionField
              index={1}
              compact
              question={questionText(
                journeyConfig,
                "respond",
                "How did people respond when you tested it?",
              )}
              placeholder={questionPlaceholder(journeyConfig, "respond", "Students said...")}
              value={respond}
              onChange={setRespond}
              done={respond.trim().length > 0}
              disabled={locked}
            />
            <QuestionField
              index={2}
              compact
              question={questionText(journeyConfig, "worked", "What worked?")}
              placeholder={questionPlaceholder(
                journeyConfig,
                "worked",
                "Wait time felt shorter because...",
              )}
              value={worked}
              onChange={setWorked}
              done={worked.trim().length > 0}
              disabled={locked}
            />
            <QuestionField
              index={3}
              compact
              question={questionText(journeyConfig, "didntWork", "What didn't work?")}
              placeholder={questionPlaceholder(journeyConfig, "didntWork", "Some students still...")}
              value={didntWork}
              onChange={setDidntWork}
              done={didntWork.trim().length > 0}
              disabled={locked}
            />
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground">Improvement phase</p>
            <QuestionField
              index={1}
              compact
              question={questionText(
                journeyConfig,
                "improve",
                "What is one improvement you would make next?",
              )}
              placeholder={questionPlaceholder(journeyConfig, "improve", "Next time I would...")}
              value={improve}
              onChange={setImprove}
              done={improve.trim().length > 0}
              disabled={locked}
            />
            <QuestionField
              index={2}
              compact
              question={questionText(
                journeyConfig,
                "implementation",
                "How will you implement these improvements?",
              )}
              placeholder={questionPlaceholder(
                journeyConfig,
                "implementation",
                "Describe the steps, tools, or changes you will use...",
              )}
              value={implementation}
              onChange={setImplementation}
              done={implementation.trim().length > 0}
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
          onPrevious={() => router.push(ROUTES.mission(3))}
          previousLabel="Back to Analyze"
          onSubmit={handleSubmit}
          submitDisabled={!canComplete}
          isSubmitting={isSubmitting}
          isSubmitted={locked}
          onNext={locked ? () => router.push(ROUTES.mission(5)) : undefined}
          nextLabel="Next: Your Proof"
        />
      }
    />
  );
}

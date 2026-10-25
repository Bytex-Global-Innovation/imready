"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  QuestionField,
  SelectedProblemBanner,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import {
  questionHelper,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
  useSelectedProblemText,
} from "../lib/foundation-journey";

const MISSION_ID = 2;
const mission = getMission(MISSION_ID);


export function Mission2Engage() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const selectedProblemText = useSelectedProblemText();
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [observation, setObservation] = useState("");
  const [surprise, setSurprise] = useState("");
  const [quotes, setQuotes] = useState("");
  const [patterns, setPatterns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setObservation((record.answers.observation as string) ?? "");
      setSurprise((record.answers.surprise as string) ?? "");
      setQuotes((record.answers.quotes as string) ?? "");
      setPatterns((record.answers.patterns as string) ?? "");
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

  // Still drives the submit button even though the checklist card is no longer shown.
  const checklist = [
    { label: "Talk to at least 2–3 people", done: observation.trim().length > 0 },
    { label: "Ask open questions", done: surprise.trim().length > 0 },
    { label: "Listen without interrupting", done: quotes.trim().length > 0 },
    { label: "Capture what you heard", done: Boolean(evidence.filePath) && patterns.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { observation, surprise, quotes, patterns };
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

  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Foundation" current="Active Mission" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 2 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      main={
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Objective of Engage mission</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 1 of 2</span>
            </div>
           <div className="mt-1 text-sm text-muted">
  <ul className="list-decimal pl-5 space-y-1">
    <li>Identify people who experience the problem you observed in Mission 1.</li>
    <li>Start a conversation with them about their experiences.</li>
    <li>Ask open-ended questions to understand their challenges and frustrations.</li>
    <li>Listen carefully to their responses without assuming or suggesting solutions.</li>
    <li>Submit key responses and takeaways from your conversations.</li>
  </ul>

    <p className="mt-2">
    <strong>Remember:</strong> Talk less, listen more, and understand the problem through people's real experiences.
  </p>
</div>

<h2 className="mt-6 font-display text-lg font-bold text-foreground">
  Add evidence from your conversation
</h2>

<div className="mt-3">
  <EvidenceCapture missionId={MISSION_ID} value={evidence} onChange={setEvidence} />
</div>
            <label className="mt-6 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
              {questionText(journeyConfig, "observation", "Field observation")}
            </label>
            <textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              rows={3}
              placeholder={questionPlaceholder(journeyConfig, "observation")}
              className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Capture Key Insights &amp; What Surprised You</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 2 of 2</span>
            </div>
            <p className="mt-1 mb-4 text-sm text-muted">Uncover unexpected tensions and real user mental models</p>

            <QuestionField
              index={1}
              question={questionText(
                journeyConfig,
                "surprise",
                "What surprised you the most during this interaction?",
              )}
              helper={questionHelper(
                journeyConfig,
                "surprise",
                "Identifies behavior that contradicts assumptions.",
              )}
              placeholder={questionPlaceholder(journeyConfig, "surprise")}
              value={surprise}
              onChange={setSurprise}
              done={surprise.trim().length > 0}
            />
            <QuestionField
              index={2}
              question={questionText(
                journeyConfig,
                "quotes",
                "Any direct quotes that capture their frustration or mindset?",
              )}
              helper={questionHelper(
                journeyConfig,
                "quotes",
                "Capture verbatim language instead of translating into your own words.",
              )}
              placeholder={questionPlaceholder(journeyConfig, "quotes")}
              value={quotes}
              onChange={setQuotes}
              done={quotes.trim().length > 0}
            />
            <QuestionField
              index={3}
              question={questionText(
                journeyConfig,
                "patterns",
                "What repeating patterns do you see across multiple conversations?",
              )}
              helper={questionHelper(
                journeyConfig,
                "patterns",
                "Highlight recurring feelings, wait loops, or workarounds.",
              )}
              placeholder={questionPlaceholder(journeyConfig, "patterns")}
              value={patterns}
              onChange={setPatterns}
              done={patterns.trim().length > 0}
            />

            {submitError ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <MissionFooterNav
              onPrevious={() => router.push(ROUTES.mission(1))}
              onNext={handleComplete}
              nextLabel="Next: Complete Mission 2"
              nextDisabled={!canComplete}
              isSubmitting={isSubmitting}
            />
          </div>
        </>
      }
      sidebar={
        <>
          <SelectedProblemBanner statementText={selectedProblemText} />
          <TipFromReady advisorLabel={tipAdvisor} quote={tipQuote} />

          <ReadyQuestMap currentMission={MISSION_ID} />
        </>
      }
    />
  );
}
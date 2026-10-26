"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft, toEvidenceMeta } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  EvidenceCapture,
  isAllowedEvidenceFileName,
  MissionBreadcrumb,
  MissionFooterNav,
  MissionLayout,
  SelectedProblemBanner,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import {
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
  useSelectedProblemText,
} from "../lib/foundation-journey";

const MISSION_ID = 5;
const mission = getMission(MISSION_ID);

export function Mission5Yield() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const selectedProblemText = useSelectedProblemText();
  const router = useRouter();
  const { refresh } = useStudentProfile();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [validation, setValidation] = useState("");
  const [impact, setImpact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
 const [improvements, setImprovements] = useState("");
  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setImprovements((record.answers.improvements as string) ?? "");
      setValidation((record.answers.validation as string) ?? "");
      setImpact((record.answers.impact as string) ?? "");
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
  { label: "Upload final proof document", done: Boolean(evidence.filePath) },
  { label: "Describe improvements to your prototype", done: improvements.trim().length > 0 },
  { label: "Describe how you validated it", done: validation.trim().length > 0 },
  { label: "Reflect on the impact", done: impact.trim().length > 0 },
];
  const canComplete = checklist.every((item) => item.done);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { improvements, validation, impact };
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, answers, evidenceMeta);
      const result = await completeMission(MISSION_ID, answers, evidenceMeta);
      if (result.foundationComplete) {
        await refresh();
      }
      router.push(ROUTES.foundationComplete);
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
      breadcrumb={<MissionBreadcrumb stageLabel="Foundation" current="Mission 5: Your Proof" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 5 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      main={
        <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Show your final proof</h2>
          
          <div className="mt-4">
            <EvidenceCapture missionId={MISSION_ID} value={evidence} onChange={setEvidence} />
          </div>
          <label className="mt-6 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
  Did you make any improvements to your prototype from the previous mission (Do)? If yes, what did you change?
</label>
<textarea
  value={improvements}
  onChange={(event) => setImprovements(event.target.value)}
  rows={3}
  placeholder="e.g. Made the numbers larger after students struggled to read them from a distance. If you made no changes, briefly explain why."
  className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
/>

          <label className="mt-6 mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted uppercase">
            
            {questionText(journeyConfig, "validation", "How did you validate it?")}
          </label>
          <textarea
            value={validation}
            onChange={(event) => setValidation(event.target.value)}
            rows={3}
            placeholder={questionPlaceholder(
              journeyConfig,
              "validation",
              "e.g. Checked back with 3 students who used your solution...",
            )}
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
            {questionText(journeyConfig, "impact", "What impact did it have?")}
          </label>
          <textarea
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
            rows={3}
            placeholder={questionPlaceholder(
              journeyConfig,
              "impact",
              "What changed for them because of your fix?",
            )}
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <MissionFooterNav
            onPrevious={() => router.push(ROUTES.mission(4))}
            onNext={handleComplete}
            nextLabel="Complete Foundation Stage"
            nextDisabled={!canComplete}
            isSubmitting={isSubmitting}
          />
        </div>
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
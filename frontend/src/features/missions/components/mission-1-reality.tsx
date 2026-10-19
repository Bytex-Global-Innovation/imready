"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft, toEvidenceMeta } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  AutosaveStatus,
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
  questionHelper,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";

const MISSION_ID = 1;
const mission = getMission(MISSION_ID);

export function Mission1Reality() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [caption, setCaption] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setCaption((record.answers.caption as string) ?? "");
      setReflection((record.answers.reflection as string) ?? "");
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
      { caption, reflection },
      toEvidenceMeta(evidence),
    );
  }

  const reflectionWords = reflection.trim() ? reflection.trim().split(/\s+/).length : 0;
  const canComplete = caption.trim().length > 0 && reflection.trim().length > 0;

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, { caption, reflection }, evidenceMeta);
      await completeMission(MISSION_ID, { caption, reflection }, evidenceMeta);
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

  const evidenceSectionTitle =
    journeyConfig?.evidenceConfig?.sectionTitle ?? "Add evidence from your observation";
  const evidenceSectionDescription =
    journeyConfig?.evidenceConfig?.sectionDescription ??
    "Upload a document describing what you saw. Include Google Drive links to any photos or recordings.";
  const captionLabel = questionText(journeyConfig, "caption", "Short title / caption");
  const captionHelper = questionHelper(
    journeyConfig,
    "caption",
    "Keep it concise and clear about the friction trigger.",
  );
  const reflectionHelper = questionHelper(
    journeyConfig,
    "reflection",
    "A few lines about what surprised you. What stood out?",
  );
  const reflectionPlaceholder = questionPlaceholder(
    journeyConfig,
    "reflection",
    "Type your observation here...",
  );
  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Stage 0: Foundation" current="Mission 1: Reality" />}
      badge={<ActiveMissionBadge label={mission.activeBadgeLabel} />}
      title={mission.title}
      subtitle={mission.subtitle}
      headerRight={
        <MissionProgressPanel label="Mission 1 Progress" stepLabel="Step 1 of 2 (50%)" percent={50} nextLabel="Reflection & Debrief" />
      }
      main={
        <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Add evidence from your observation</h2>
          
          <span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
            Step 1 of 2: Observation &amp; Evidence
          </span>

          <div className="mt-5">
            <EvidenceCapture
              missionId={MISSION_ID}
              value={evidence}
              onChange={setEvidence}
              caption={caption}
              captionLabel={captionLabel}
              captionHelper={captionHelper}
              uploadHelper={journeyConfig?.evidenceConfig?.uploadHelper}
              onCaptionChange={setCaption}
            />
          </div>

          <label className="mt-6 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase">
            <span>Reflect on what you noticed</span>
            <span>Question 2 of 2</span>
          </label>
          <p className="mb-2 text-sm text-muted">{reflectionHelper}</p>
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={4}
            placeholder="Example: Long queue at the canteen during lunch hour. Many students did not know how long they had to wait. Some kept asking others when their order will be ready."
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2">
            <AutosaveStatus wordCount={reflectionWords} />
          </div>

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <MissionFooterNav
            onPrevious={() => router.push(ROUTES.dashboard)}
            previousLabel="Back to Dashboard"
            onSaveDraft={persist}
            onNext={handleComplete}
            nextLabel="Next: Reflection & Submit"
            nextDisabled={!canComplete}
            isSubmitting={isSubmitting}
          />
        </div>
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
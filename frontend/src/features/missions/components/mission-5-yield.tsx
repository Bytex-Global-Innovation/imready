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
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";

const MISSION_ID = 5;
const mission = getMission(MISSION_ID);

export function Mission5Yield() {
  const router = useRouter();
  const { refresh } = useStudentProfile();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [validation, setValidation] = useState("");
  const [impact, setImpact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
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

  async function persist() {
    await saveMissionDraft(
      MISSION_ID,
      { validation, impact },
      toEvidenceMeta(evidence),
    );
  }

  // Still drives the submit button even though the checklist card is no longer shown.
  const checklist = [
    { label: "Upload final proof document", done: Boolean(evidence.filePath) },
    { label: "Describe how you validated it", done: validation.trim().length > 0 },
    { label: "Reflect on the impact", done: impact.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const answers = { validation, impact };
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, answers, evidenceMeta);
      const result = await completeMission(MISSION_ID, answers, evidenceMeta);
      if (result.projectsUnlocked) {
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

  if (!hydrated) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Stage 0: Foundation" current="Mission 5: Your Proof" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 5 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      main={
        <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Show your final proof</h2>
          <p className="mt-1 text-sm text-muted">
            Upload a document with your final proof and Google Drive links to photos, videos, or recordings.
          </p>
          <div className="mt-4">
            <EvidenceCapture missionId={MISSION_ID} value={evidence} onChange={setEvidence} />
          </div>

          <label className="mt-6 mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted uppercase">
            <ExternalLink className="h-3.5 w-3.5" />
            How did you validate it?
          </label>
          <textarea
            value={validation}
            onChange={(event) => setValidation(event.target.value)}
            rows={3}
            placeholder="e.g. Checked back with 3 students who used the canteen token board..."
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
            What impact did it have?
          </label>
          <textarea
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
            rows={3}
            placeholder="What changed for them because of your fix?"
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <MissionFooterNav
            onPrevious={() => router.push(ROUTES.mission(4))}
            onSaveDraft={persist}
            onNext={handleComplete}
            nextLabel="Complete Foundation Stage"
            nextDisabled={!canComplete}
            isSubmitting={isSubmitting}
          />
        </div>
      }
      sidebar={
        <>
          <TipFromReady advisorLabel={mission.tip.advisorLabel} quote={mission.tip.quote} />
          <ReadyQuestMap currentMission={MISSION_ID} />
        </>
      }
    />
  );
}
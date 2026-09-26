"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  EvidenceCapture,
  MissionBreadcrumb,
  MissionDetailsCard,
  MissionFooterNav,
  MissionLayout,
  TaskChecklist,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";

const MISSION_ID = 5;
const mission = getMission(MISSION_ID);

export function Mission5Yield() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, previewUrl: null });
  const [validation, setValidation] = useState("");
  const [impact, setImpact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const record = getMissionRecord(MISSION_ID);
    setValidation((record.answers.validation as string) ?? "");
    setImpact((record.answers.impact as string) ?? "");
  }, []);

  function persist() {
    saveMissionDraft(MISSION_ID, { validation, impact }, { fileName: evidence.fileName, fileType: null, previewDataUrl: null });
  }

  const checklist = [
    { label: "Show your final artifact", done: Boolean(evidence.fileName) },
    { label: "Describe how you validated it", done: validation.trim().length > 0 },
    { label: "Reflect on the impact", done: impact.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done);

  function handleComplete() {
    if (!canComplete) return;
    setIsSubmitting(true);
    persist();
    completeMission(MISSION_ID, mission.xpReward);
    router.push(ROUTES.foundationComplete);
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
            Bring back your prototype from Mission 4 and show what changed for the people who tried it.
          </p>
          <div className="mt-4">
            <EvidenceCapture methods={["photo", "video", "note"]} value={evidence} onChange={setEvidence} />
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
          <TaskChecklist items={checklist} />
          <MissionDetailsCard estTime={mission.estTime} target={mission.target} location={mission.location} />
        </>
      }
    />
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  AutosaveStatus,
  EvidenceCapture,
  MissionBreadcrumb,
  MissionDetailsCard,
  MissionFooterNav,
  MissionLayout,
  MissionProgressPanel,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";

const MISSION_ID = 1;
const mission = getMission(MISSION_ID);

const FRICTION_EXAMPLES = [
  { title: "Long queue at the canteen", detail: "People constantly checking watches or leaving in frustration." },
  { title: "Students looking for a classroom", detail: "Wandering near stairwells, squinting at complex room numbers." },
  { title: "Difficulty getting a document", detail: "Bouncing across three administrative counters for a single stamp." },
  { title: "A busy library or lab", detail: "Unclear printer queuing resulting in wasted printouts." },
];

export function Mission1Reality() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, previewUrl: null });
  const [caption, setCaption] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const record = getMissionRecord(MISSION_ID);
    setCaption((record.answers.caption as string) ?? "");
    setReflection((record.answers.reflection as string) ?? "");
    if (record.evidence?.fileName) {
      setEvidence({ fileName: record.evidence.fileName, previewUrl: null });
    }
  }, []);

  function persist() {
    saveMissionDraft(MISSION_ID, { caption, reflection }, { fileName: evidence.fileName, fileType: null, previewDataUrl: null });
  }

  const reflectionWords = reflection.trim() ? reflection.trim().split(/\s+/).length : 0;
  const canComplete = caption.trim().length > 0 && reflection.trim().length > 0;

  function handleComplete() {
    if (!canComplete) return;
    setIsSubmitting(true);
    persist();
    completeMission(MISSION_ID, mission.xpReward);
    router.push(ROUTES.missionComplete(MISSION_ID));
  }

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
          <p className="mt-1 text-sm text-muted">Capture what you saw in the moment to ground your analysis.</p>
          <span className="mt-3 inline-block rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
            Step 1 of 2: Observation &amp; Evidence
          </span>

          <div className="mt-5">
            <EvidenceCapture
              methods={["photo", "note", "voice"]}
              value={evidence}
              onChange={setEvidence}
              caption={caption}
              captionLabel="Short title / caption"
              captionHelper="Keep it concise and clear about the friction trigger."
              onCaptionChange={setCaption}
            />
          </div>

          <label className="mt-6 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase">
            <span>Reflect on what you noticed</span>
            <span>Question 2 of 2</span>
          </label>
          <p className="mb-2 text-sm text-muted">A few lines about what surprised you. What stood out?</p>
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={4}
            placeholder="Type your observation here..."
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2">
            <AutosaveStatus wordCount={reflectionWords} />
          </div>

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
          <TipFromReady advisorLabel={mission.tip.advisorLabel} quote={mission.tip.quote} />

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Examples of Friction</p>
              <span className="text-xs text-muted">Ideas to spot</span>
            </div>
            <ul className="space-y-3">
              {FRICTION_EXAMPLES.map((example) => (
                <li key={example.title} className="text-sm">
                  <p className="font-medium text-foreground">{example.title}:</p>
                  <p className="text-muted">{example.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <MissionDetailsCard estTime={mission.estTime} target={mission.target} location={mission.location} />

          <div className="flex gap-2.5 rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted">
              Remember to respect student privacy. Focus on processes and interactions, not personal faces.
            </p>
          </div>
        </>
      }
    />
  );
}
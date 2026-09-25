"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "@/components/icons";
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
  QuestionField,
  TaskChecklist,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";

const MISSION_ID = 4;
const mission = getMission(MISSION_ID);

const INSPIRATION_LINKS = ["Paper Tickets & Slips", "Numbered Desk Cards", "Whiteboard Status Queue"];

export function Mission4Do() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, previewUrl: null });
  const [description, setDescription] = useState("");
  const [respond, setRespond] = useState("");
  const [worked, setWorked] = useState("");
  const [didntWork, setDidntWork] = useState("");
  const [improve, setImprove] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const record = getMissionRecord(MISSION_ID);
    setDescription((record.answers.description as string) ?? "");
    setRespond((record.answers.respond as string) ?? "");
    setWorked((record.answers.worked as string) ?? "");
    setDidntWork((record.answers.didntWork as string) ?? "");
    setImprove((record.answers.improve as string) ?? "");
  }, []);

  function persist() {
    saveMissionDraft(
      MISSION_ID,
      { description, respond, worked, didntWork, improve },
      { fileName: evidence.fileName, fileType: null, previewDataUrl: null },
    );
  }

  const checklist = [
    { label: "Make a simple prototype (keep it small)", done: Boolean(evidence.fileName) },
    { label: "Test it with real users", done: respond.trim().length > 0 },
    { label: "Observe what happens", done: worked.trim().length > 0 && didntWork.trim().length > 0 },
    { label: "Make one improvement", done: improve.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done) && description.trim().length > 0;

  function handleComplete() {
    if (!canComplete) return;
    setIsSubmitting(true);
    persist();
    completeMission(MISSION_ID, mission.xpReward);
    router.push(ROUTES.missionComplete(MISSION_ID));
  }

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Stage 0: Foundation" current="Active Mission" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 4 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      headerRight={
        mission.frameworkPhaseLabel ? (
          <span className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-primary">
            {mission.frameworkPhaseLabel}
          </span>
        ) : undefined
      }
      main={
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Show What You Built: Prototype Evidence</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 1 of 2</span>
            </div>
            <div className="mt-4">
              <EvidenceCapture methods={["photo", "video", "note"]} value={evidence} onChange={setEvidence} />
            </div>
            <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
              Artifact Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Describe what you built and how it works..."
              className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Tell Us What Happened: Test Reflection</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 2 of 2</span>
            </div>
            <p className="mt-1 mb-4 text-sm text-muted">Document your real-world test results</p>

            <QuestionField index={1} question="How did people respond?" value={respond} onChange={setRespond} done={respond.trim().length > 0} />
            <QuestionField index={2} question="What worked?" value={worked} onChange={setWorked} done={worked.trim().length > 0} />
            <QuestionField index={3} question="What didn't work?" value={didntWork} onChange={setDidntWork} done={didntWork.trim().length > 0} />
            <QuestionField index={4} question="What will you improve next?" value={improve} onChange={setImprove} done={improve.trim().length > 0} />

            <MissionFooterNav
              onPrevious={() => router.push(ROUTES.mission(3))}
              previousLabel="Mission 3: Analyze"
              onSaveDraft={persist}
              onNext={handleComplete}
              nextLabel="Complete Mission 4"
              nextDisabled={!canComplete}
              isSubmitting={isSubmitting}
            />
          </div>
        </>
      }
      sidebar={
        <>
          <TipFromReady advisorLabel={mission.tip.advisorLabel} quote={mission.tip.quote} />
          <TaskChecklist items={checklist} />
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Need inspiration?
            </p>
            <ul className="space-y-2">
              {INSPIRATION_LINKS.map((link) => (
                <li key={link} className="rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm">
                  {link}
                </li>
              ))}
            </ul>
          </div>
          <MissionDetailsCard title="Mission Logistics" estTime={mission.estTime} target="Physical / Low-fi prototype" location={mission.location} />
        </>
      }
    />
  );
}
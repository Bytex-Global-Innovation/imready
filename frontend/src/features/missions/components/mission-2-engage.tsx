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
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";

const MISSION_ID = 2;
const mission = getMission(MISSION_ID);
const EXAMPLE_QUESTIONS = [
  "Do you think waste management is a problem on our campus?",
  "Where do you notice the most waste?",
  "How does it affect students?",
  "What do you think is the main reason behind this problem?",
  "Have you tried doing anything to solve it?",
  "What changes would you like to see?",
] as const;
export function Mission2Engage() {
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

  async function persist() {
    await saveMissionDraft(
      MISSION_ID,
      { observation, surprise, quotes, patterns },
      toEvidenceMeta(evidence),
    );
  }

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

  if (!hydrated) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Stage 0: Foundation" current="Active Mission" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 2 of 5`} />}
      title={mission.title}
      subtitle={mission.subtitle}
      main={
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Add evidence from your conversation</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 1 of 2</span>
            </div>
            
            <div className="mt-4">
              <EvidenceCapture missionId={MISSION_ID} value={evidence} onChange={setEvidence} />
            </div>
            <label className="mt-6 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
              Field observation
            </label>
            <textarea
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              question="What surprised you the most during this interaction?"
              helper="Identifies behavior that contradicts assumptions."
              value={surprise}
              onChange={setSurprise}
              done={surprise.trim().length > 0}
            />
            <QuestionField
              index={2}
              question="Any direct quotes that capture their frustration or mindset?"
              helper="Capture verbatim language instead of translating into your own words."
              value={quotes}
              onChange={setQuotes}
              done={quotes.trim().length > 0}
            />
            <QuestionField
              index={3}
              question="What repeating patterns do you see across multiple conversations?"
              helper="Highlight recurring feelings, wait loops, or workarounds."
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
              onSaveDraft={persist}
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
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
  <div className="flex items-center gap-2">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
      AI
    </span>
    <p className="text-sm font-semibold text-foreground">Tip from READY</p>
    <span className="ml-auto shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase">
      {mission.tip.advisorLabel}
    </span>
  </div>

  <p className="mt-3 text-sm leading-relaxed text-muted italic">
    &ldquo;People often say one thing, but do another. Look for stories, not opinions.&rdquo;
  </p>

  <div className="mt-4 rounded-[var(--radius-card)] bg-surface p-3">
    <p className="text-sm font-semibold text-foreground">
      Example: Improving Campus Waste Management
    </p>
    <p className="mt-2 text-xs text-muted">Ask people questions like:</p>
    <ul className="mt-1.5 space-y-1.5">
      {EXAMPLE_QUESTIONS.map((question) => (
        <li key={question} className="flex gap-2 text-sm leading-snug text-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          &ldquo;{question}&rdquo;
        </li>
      ))}
    </ul>
    <p className="mt-3 text-xs leading-relaxed text-muted">
      These questions help you understand people&apos;s experiences, opinions, and needs before deciding on a solution.
    </p>
  </div>
</div>
          <ReadyQuestMap currentMission={MISSION_ID} />
        </>
      }
    />
  );
}
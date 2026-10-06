"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ShieldCheck } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft, toEvidenceMeta } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  EvidenceCapture,
  isAllowedEvidenceFileName,
  MissionBreadcrumb,
  MissionDetailsCard,
  MissionFooterNav,
  MissionLayout,
  QuestionField,
  TaskChecklist,
  TipFromReady,
  type EvidenceValue,
} from "./mission-ui";

const MISSION_ID = 2;
const mission = getMission(MISSION_ID);

const SAMPLE_QUESTIONS = [
  "How do you decide when to order?",
  "What do you do while waiting for food?",
  "What is the most frustrating part of this?",
];

export function Mission2Engage() {
  const router = useRouter();
  const [evidence, setEvidence] = useState<EvidenceValue>({ fileName: null, filePath: null, previewUrl: null });
  const [observation, setObservation] = useState("");
  const [surprise, setSurprise] = useState("");
  const [quotes, setQuotes] = useState("");
  const [patterns, setPatterns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  const checklist = [
    { label: "Talk to at least 2–3 people", caption: "Completed with campus peers", done: observation.trim().length > 0 },
    { label: "Ask open questions", caption: 'Used "How", "Why", and "Tell me about..."', done: surprise.trim().length > 0 },
    { label: "Listen without interrupting", caption: "Gave full space for pauses and stories", done: quotes.trim().length > 0 },
    { label: "Capture what you heard", caption: "Evidence document with Drive links uploaded", done: Boolean(evidence.filePath) && patterns.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done);

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const answers = { observation, surprise, quotes, patterns };
      const evidenceMeta = toEvidenceMeta(evidence);
      await saveMissionDraft(MISSION_ID, answers, evidenceMeta);
      await completeMission(MISSION_ID, answers, evidenceMeta);
      router.push(ROUTES.missionComplete(MISSION_ID));
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
            <p className="mt-1 text-sm text-muted">
              Upload a document with your notes and Google Drive links to any recordings or photos.
            </p>
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
          <TipFromReady advisorLabel={mission.tip.advisorLabel} quote={mission.tip.quote} />
          <TaskChecklist items={checklist} />
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              Need help? Sample questions
            </p>
            <ul className="space-y-2">
              {SAMPLE_QUESTIONS.map((question) => (
                <li key={question} className="rounded-[var(--radius-card)] bg-white px-3 py-2 text-sm text-foreground shadow-sm">
                  &ldquo;{question}&rdquo;
                </li>
              ))}
            </ul>
          </div>
          <MissionDetailsCard estTime={mission.estTime} target={mission.target} location={mission.location} />
          <div className="flex gap-2.5 rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted">
              Always ask for consent before quoting campus members or recording audio. Never share full names without permission.
            </p>
          </div>
        </>
      }
    />
  );
}
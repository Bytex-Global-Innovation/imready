"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ShieldCheck } from "@/components/icons";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { completeMission, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  MissionBreadcrumb,
  MissionDetailsCard,
  MissionFooterNav,
  MissionLayout,
  QuestionField,
  TaskChecklist,
  TipFromReady,
} from "./mission-ui";

const MISSION_ID = 2;
const mission = getMission(MISSION_ID);

const SAMPLE_QUESTIONS = [
  {
    question: "How do you decide when to order?",
    answer: "Usually when the queue looks short, but I've been wrong a few times and ended up waiting even longer.",
  },
  {
    question: "What do you do while waiting for food?",
    answer: "I just stand near the counter and keep glancing at the staff, hoping they'll call my number soon.",
  },
  {
    question: "What is the most frustrating part of this?",
    answer: "Not knowing how long it'll actually take — if I knew, I'd just go sit down instead of hovering.",
  },
];

export function Mission2Engage() {
  const router = useRouter();
  const [observation, setObservation] = useState("");
  const [surprise, setSurprise] = useState("");
  const [quotes, setQuotes] = useState("");
  const [patterns, setPatterns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const record = getMissionRecord(MISSION_ID);
    setObservation((record.answers.observation as string) ?? "");
    setSurprise((record.answers.surprise as string) ?? "");
    setQuotes((record.answers.quotes as string) ?? "");
    setPatterns((record.answers.patterns as string) ?? "");
  }, []);

  function persist() {
    saveMissionDraft(MISSION_ID, { observation, surprise, quotes, patterns }, null);
  }

  const checklist = [
    { label: "Talk to at least 2–3 people", caption: "Completed with campus peers", done: observation.trim().length > 0 },
    { label: "Ask open questions", caption: 'Used "How", "Why", and "Tell me about..."', done: surprise.trim().length > 0 },
    { label: "Listen without interrupting", caption: "Gave full space for pauses and stories", done: quotes.trim().length > 0 },
    { label: "Capture what you heard", caption: "Voice snippet + insights logged below", done: patterns.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done);

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
            <p className="mt-1 text-sm text-muted">Capture direct sound bites, notes, or field photos</p>
            <label className="mt-4 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
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
  <ul className="space-y-3">
    {SAMPLE_QUESTIONS.map((item) => (
      <li key={item.question} className="rounded-[var(--radius-card)] bg-white p-3 shadow-sm">
        <p className="text-sm font-medium text-foreground">&ldquo;{item.question}&rdquo;</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-primary">Sample answer: </span>
          {item.answer}
        </p>
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
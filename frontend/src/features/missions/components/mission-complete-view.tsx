"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Flame, Lock, Zap } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MISSIONS, MISSION_COMPLETE_CONTENT, getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { ensureFoundationProgress, getMissionRecord, getTotalXp } from "../lib/mission-progress";

const STAGE_TRACKER = [
  { label: "Stage 0: Foundation", status: "active" as const },
  { label: "Stage 1: Projects", status: "next" as const },
  { label: "Stage 2: Mentorship", status: "locked" as const },
  { label: "Stage 3: Industry", status: "locked" as const },
];

export function MissionCompleteView({ missionId }: { missionId: number }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const mission = getMission(missionId);
  const content = MISSION_COMPLETE_CONTENT[missionId];
  const nextMission = MISSIONS.find((m) => m.id === missionId + 1);

  useEffect(() => {
    ensureFoundationProgress().finally(() => setReady(true));
  }, []);

  const record = useMemo(() => (ready ? getMissionRecord(missionId) : { answers: {} }), [missionId, ready]);
  const totalXp = ready ? getTotalXp() : 0;
  const recap = content.getRecap(record.answers);
  const completedCount = missionId;
  const percent = Math.round((completedCount / MISSIONS.length) * 100);

  function goNext() {
    router.push(nextMission ? ROUTES.mission(nextMission.id) : ROUTES.foundationComplete);
  }

  if (!ready) {
    return <div className="py-12 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">
        Journey <span className="mx-1 text-brand-100">/</span> Stage 0: Foundation{" "}
        <span className="mx-1 text-brand-100">/</span> <span className="text-emerald-600">Mission {missionId} Complete</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
        {STAGE_TRACKER.map((stage) => (
          <div key={stage.label} className="flex items-center gap-2">
            <span
              className={
                stage.status === "active"
                  ? "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                  : stage.status === "next"
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"
                    : "flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-muted"
              }
            >
              {stage.status === "active" ? <Check className="h-3.5 w-3.5" /> : stage.status === "locked" ? <Lock className="h-3 w-3" /> : null}
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                {stage.status === "active" ? "Active" : stage.status === "next" ? "Next Stage" : "Locked"}
              </p>
              <p className="text-sm font-medium text-foreground">{stage.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-7 w-7" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold text-foreground">Mission {missionId} Complete!</h1>
            <p className="mt-2 text-base text-muted">{content.celebrationLine}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <Flame className="h-4 w-4" />
              +{mission.xpReward} READY Points
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">XP Earned</span>
            </span>
            <p className="mt-4 text-sm text-muted">Keep going. You&apos;re building a sharper eye for reality.</p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">AI</span>
                READY Coach Reflection
              </p>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Observation Validated
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground italic">&ldquo;{content.coachQuote}&rdquo;</p>
            <p className="mt-2 text-xs text-muted">— READY Coach</p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Submitted Evidence Recap
              </p>
              <span className="text-xs text-muted">
                Mission {missionId} • {mission.letterWord} ({mission.letter})
              </span>
            </div>

            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">{content.evidenceLabel}</p>
                <p className="mt-0.5 font-medium text-foreground">{recap.evidence}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">{content.insightLabel}</p>
                <p className="mt-0.5 text-muted">&ldquo;{recap.insight}&rdquo;</p>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{percent}% Foundation Completed</span>
                <span className="text-muted">{completedCount} of 5 missions done</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {MISSIONS.map((m) => (
                  <span
                    key={m.id}
                    className={
                      m.id <= completedCount
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
                        : "rounded-full bg-surface px-2.5 py-1 text-muted"
                    }
                  >
                    {m.id <= completedCount ? "✓ " : ""}[{m.letter}] {m.letterWord}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={goNext} className="sm:min-w-[220px]">
              {nextMission ? `Next Mission (${nextMission.letter}: ${nextMission.letterWord})` : "View Foundation Results"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => router.push(ROUTES.dashboard)}>
              View My Foundation Journey
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          {nextMission ? (
            <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
              <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-primary">
                Up Next · Mission {nextMission.id} of 5
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-foreground">{nextMission.title}</h3>
              <p className="mt-1 text-sm text-muted">{nextMission.subtitle}</p>

              <p className="mt-4 text-xs font-semibold tracking-wider text-muted uppercase">What you&apos;ll do</p>
              <ol className="mt-2 space-y-2.5">
                {nextMission.whatYoullDo.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-sm text-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-card)] bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <Zap className="h-4 w-4" />
                Unlock for Mission {nextMission.id}: <span className="font-semibold">+{nextMission.xpReward} READY Points</span>
              </div>

              <Button onClick={goNext} className="mt-4 w-full">
                Preview Mission {nextMission.id} Brief
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Foundation Status</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">On Track</span>
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Total XP</dt>
                <dd className="font-semibold text-foreground">{totalXp}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Stage 0 Completion</dt>
                <dd className="font-semibold text-foreground">{percent}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Verified Observations</dt>
                <dd className="font-semibold text-foreground">
                  {completedCount} Item{completedCount === 1 ? "" : "s"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Stage 1 Project Unlock</dt>
                <dd className="font-semibold text-foreground">
                  {nextMission ? `In ${5 - completedCount} Missions` : "Unlocked"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
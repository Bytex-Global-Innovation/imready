"use client";

import { useEffect, useState } from "react";
import { Check, Lock } from "@/components/icons";
import { cn } from "@/lib/utils";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
} from "../lib/mission-progress";

type StepState = "completed" | "active" | "locked";

interface QuestStep {
  number: number;
  letter: string;
  title: string;
  badgeClass: string;
  ringClass: string;
  lineClass: string;
}

const QUEST_STEPS: QuestStep[] = [
  {
    number: 1,
    letter: "R",
    title: "Reality",
    badgeClass: "bg-rose-500",
    ringClass: "ring-rose-200",
    lineClass: "bg-rose-400",
  },
  {
    number: 2,
    letter: "E",
    title: "Engage",
    badgeClass: "bg-emerald-500",
    ringClass: "ring-emerald-200",
    lineClass: "bg-emerald-400",
  },
  {
    number: 3,
    letter: "A",
    title: "Analyze",
    badgeClass: "bg-amber-500",
    ringClass: "ring-amber-200",
    lineClass: "bg-amber-400",
  },
  {
    number: 4,
    letter: "D",
    title: "Do",
    badgeClass: "bg-blue-600",
    ringClass: "ring-blue-200",
    lineClass: "bg-blue-500",
  },
  {
    number: 5,
    letter: "Y",
    title: "Your Proof",
    badgeClass: "bg-violet-500",
    ringClass: "ring-violet-200",
    lineClass: "bg-violet-400",
  },
];

export function ReadyQuestMap({
  currentMission,
  compact = false,
}: {
  currentMission?: number;
  compact?: boolean;
}) {
  const [activeMission, setActiveMission] = useState(
    () => currentMission ?? 1,
  );

  useEffect(() => {
    ensureFoundationProgress()
      .then(() => {
        setActiveMission(currentMission ?? firstIncompleteMissionId());
      })
      .catch(() => undefined);
  }, [currentMission]);

  const unlocked = Math.min(Math.max(activeMission, 1), QUEST_STEPS.length);
  const activeStep = QUEST_STEPS.find((step) => step.number === unlocked);

  if (compact) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-white px-3.5 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
            READY Quest Map
          </span>
          <span className="text-[10px] font-medium text-muted">
            {unlocked}/{QUEST_STEPS.length}
          </span>
        </div>

        <ol className="mt-2.5 flex items-center justify-between gap-0.5">
          {QUEST_STEPS.map((step, index) => {
            const state: StepState =
              step.number < unlocked
                ? "completed"
                : step.number === unlocked
                  ? "active"
                  : "locked";
            const isLast = index === QUEST_STEPS.length - 1;

            return (
              <li key={step.letter} className="flex min-w-0 flex-1 items-center">
                <div
                  className="flex flex-col items-center gap-1"
                  title={step.title}
                >
                  <span
                    aria-current={state === "active" ? "step" : undefined}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold",
                      state === "locked" && "bg-brand-100 text-muted",
                      state === "completed" && cn(step.badgeClass, "text-white"),
                      state === "active" &&
                        cn(step.badgeClass, "text-white ring-[3px]", step.ringClass),
                    )}
                  >
                    {state === "completed" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : state === "locked" ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      step.letter
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-[3.5rem] truncate text-center text-[9px] font-semibold leading-none",
                      state === "active"
                        ? "text-primary"
                        : state === "locked"
                          ? "text-muted"
                          : "text-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {!isLast ? (
                  <span
                    aria-hidden
                    className={cn(
                      "mb-3.5 mx-0.5 h-px min-w-[0.35rem] flex-1",
                      state === "completed" ? step.lineClass : "bg-border",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        {activeStep ? (
          <p className="mt-2.5 border-t border-border pt-2 text-[11px] text-muted">
            Now in play:{" "}
            <span className="font-semibold text-foreground">{activeStep.title}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          READY Quest Map
        </span>
        <p className="text-xs text-muted">
          {unlocked} of {QUEST_STEPS.length} milestones
        </p>
      </div>

      <ol className="mt-5 flex items-start justify-between gap-1 sm:gap-2">
        {QUEST_STEPS.map((step, index) => {
          const state: StepState =
            step.number < unlocked
              ? "completed"
              : step.number === unlocked
                ? "active"
                : "locked";
          const isLast = index === QUEST_STEPS.length - 1;

          return (
            <li
              key={step.letter}
              aria-current={state === "active" ? "step" : undefined}
              className="relative flex min-w-0 flex-1 flex-col items-center text-center"
            >
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-5 left-[calc(50%+1.25rem)] h-0.5 w-[calc(100%-2.5rem)] rounded-full sm:left-[calc(50%+1.4rem)] sm:w-[calc(100%-2.8rem)]",
                    state === "completed" ? step.lineClass : "bg-border",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-shadow sm:h-11 sm:w-11 sm:text-base",
                  state === "locked" && "bg-brand-100 text-muted",
                  state === "completed" && cn(step.badgeClass, "text-white shadow-sm"),
                  state === "active" &&
                    cn(step.badgeClass, "text-white shadow-md ring-4", step.ringClass),
                )}
              >
                {state === "completed" ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : state === "locked" ? (
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  step.letter
                )}
              </span>

              <p
                className={cn(
                  "mt-2.5 text-[11px] font-semibold tracking-wide sm:text-xs",
                  state === "locked" ? "text-muted" : "text-foreground",
                )}
              >
                {step.title}
              </p>
              <span
                className={cn(
                  "mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                  state === "active"
                    ? "bg-primary/10 text-primary"
                    : "invisible",
                )}
              >
                Active
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

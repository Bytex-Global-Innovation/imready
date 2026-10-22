"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Rocket } from "@/components/icons";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { JOURNEY_PATH_STEPS } from "@/constants/dashboard";
import { ensureFoundationProgress, isFoundationComplete } from "@/features/missions/lib/mission-progress";
import { cn } from "@/lib/utils";

const MOBILE_GRID_COLUMNS = 3;

function StepBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
        isActive ? "bg-primary text-white" : "bg-brand-100 text-muted",
      )}
    >
      {isActive ? (
        <Rocket className="h-4 w-4" />
      ) : (
        <Lock className="h-4 w-4" />
      )}
    </span>
  );
}

export function JourneyPath() {
  const { unpaidProjectsUnlocked } = useStudentProfile();
  const [foundationComplete, setFoundationComplete] = useState(false);

  useEffect(() => {
    ensureFoundationProgress()
      .then(() => setFoundationComplete(isFoundationComplete()))
      .catch(() => setFoundationComplete(false));
  }, []);

  const steps = useMemo(
    () =>
      JOURNEY_PATH_STEPS.map((step) => {
        if (step.id === "foundation") {
          return {
            ...step,
            status: foundationComplete ? ("locked" as const) : ("active" as const),
          };
        }
       
        if (step.id === "industry projects") {
  return {
    ...step,
    status: unpaidProjectsUnlocked ? ("active" as const) : ("locked" as const),
  };
}
        return step;
      }),
    [foundationComplete, unpaidProjectsUnlocked],
  );

  return (
    <section className="mb-8">
      <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        Your Journey Path
      </p>

      <div className="grid grid-cols-3 gap-x-2 gap-y-6 sm:hidden">
        {steps.map((step, index) => {
          const isActive = step.status === "active";
          const isLastInRow = (index + 1) % MOBILE_GRID_COLUMNS === 0;
          const isLastOverall = index === steps.length - 1;
          const showLine = !isLastInRow && !isLastOverall;

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center text-center"
            >
              {showLine ? (
                <span
                  className={cn(
                    "absolute top-5 left-[calc(50%+1.25rem)] h-0.5 w-[calc(100%-2.5rem)]",
                    isActive ? "bg-primary" : "bg-brand-100",
                  )}
                  aria-hidden
                />
              ) : null}
              <StepBadge isActive={isActive} />
              <p
                className={cn(
                  "mt-2 text-sm font-semibold",
                  isActive ? "text-foreground" : "text-muted",
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted">{step.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block">
        <ol className="flex items-start justify-between gap-2">
          {steps.map((step, index) => {
            const isActive = step.status === "active";
            const isLast = index === steps.length - 1;
            return (
              <li
                key={step.id}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                {!isLast ? (
                  <span
                    className={cn(
                      "absolute top-5 left-[calc(50%+1.25rem)] h-0.5 w-[calc(100%-2.5rem)]",
                      isActive ? "bg-primary" : "bg-brand-100",
                    )}
                    aria-hidden
                  />
                ) : null}
                <StepBadge isActive={isActive} />
                <p
                  className={cn(
                    "mt-3 text-sm font-semibold",
                    isActive ? "text-foreground" : "text-muted",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted">{step.subtitle}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

import { Lock, Rocket } from "@/components/icons";
import { JOURNEY_PATH_STEPS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

const MOBILE_GRID_COLUMNS = 2;

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
  return (
    <section className="mb-8">
      <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        Your Journey Path
      </p>

      {/* Mobile: 3-over-2 grid, connecting lines only within the same row */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:hidden">
        {JOURNEY_PATH_STEPS.map((step, index) => {
          const isActive = step.status === "active";
          const isLastInRow = (index + 1) % MOBILE_GRID_COLUMNS === 0;
          const isLastOverall = index === JOURNEY_PATH_STEPS.length - 1;
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

      {/* Tablet and up: single row with connecting lines */}
      <div className="hidden sm:block">
        <ol className="flex items-start justify-between gap-2">
          {JOURNEY_PATH_STEPS.map((step, index) => {
            const isActive = step.status === "active";
            const isLast = index === JOURNEY_PATH_STEPS.length - 1;
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
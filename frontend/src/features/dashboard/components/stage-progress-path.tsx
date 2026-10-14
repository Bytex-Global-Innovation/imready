import { Check } from "@/components/icons";
import { STAGE_PROGRESS_STEPS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

export function StageProgressPath() {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-white p-5 sm:p-6">
      <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        Your Journey Path
      </p>
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[640px] items-start justify-between gap-2 sm:min-w-0">
          {STAGE_PROGRESS_STEPS.map((step, index) => {
            const isLast = index === STAGE_PROGRESS_STEPS.length - 1;
            const lineIsFilled = step.status !== "locked";

            return (
              <li
                key={step.id}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                {!isLast ? (
                  <span
                    className={cn(
                      "absolute top-5 left-[calc(50%+1.25rem)] h-0.5 w-[calc(100%-2.5rem)]",
                      lineIsFilled ? "bg-foreground" : "bg-brand-100",
                    )}
                    aria-hidden
                  />
                ) : null}

                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                    step.status === "completed" &&
                      "bg-foreground text-white",
                    step.status === "active" && "bg-primary text-white",
                    step.status === "locked" &&
                      "bg-brand-100 text-muted",
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.stageNumber
                  )}
                </span>

                <p
                  className={cn(
                    "mt-3 text-sm font-semibold",
                    step.status === "locked" ? "text-muted" : "text-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    step.status === "active" ? "text-primary" : "text-brand-700",
                  )}
                >
                  {step.subtitle}
                </p>
                {step.caption ? (
                  <p className="mt-0.5 max-w-[110px] text-[11px] text-muted">
                    {step.caption}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

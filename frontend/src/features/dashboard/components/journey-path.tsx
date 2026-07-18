import { Lock, Rocket } from "@/components/icons";
import { JOURNEY_PATH_STEPS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

export function JourneyPath() {
  return (
    <section className="mb-8">
      <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
        Your Journey Path
      </p>
      <div className="overflow-x-auto pb-2">
        <ol className="flex min-w-[560px] items-start justify-between gap-2 sm:min-w-0">
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
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-brand-100 text-muted",
                  )}
                >
                  {isActive ? (
                    <Rocket className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </span>
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

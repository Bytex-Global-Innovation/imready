import { ArrowRight, Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const COMPLETED_STEPS = [
  { label: "Watch the introduction video", badge: "Completed" },
  { label: "Know the industry readiness framework (R.E.A.D.Y)", badge: "Completed" },
  { label: "Select your desired problem statement", badge: "Completed" },
  { label: "Complete all 5 missions and upload your evidence in each mission", badge: "Completed" },
  { label: "Unlock industry projects", badge: "Unlocked!" },
] as const;

export function FoundationCompleteCard() {
  return (
    <section className="rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
        Congratulations on completing the Foundation Stage!
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
        You now possess the foundational knowledge of the Industry Readiness Framework
        (R.E.A.D.Y.). You are fully prepared to tackle hands-on real-world challenges.
      </p>

      <ul className="mt-6 space-y-3">
        {COMPLETED_STEPS.map((step, index) => {
          const isLast = index === COMPLETED_STEPS.length - 1;
          return (
            <li key={step.label} className="flex items-center gap-3 sm:gap-4">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  isLast
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-emerald-200 bg-emerald-50 text-emerald-600",
                )}
              >
                <Check className="h-4 w-4" />
              </span>
              <p className="min-w-0 flex-1 text-sm font-medium text-foreground sm:text-base">
                <span className="font-bold">{index + 1} .</span> {step.label}
              </p>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {isLast ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : null}
                {step.badge}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-center text-sm font-semibold text-amber-800">
        Industry Projects are now unlocked.
      </p>

      <Button href={ROUTES.projects} className="mt-6">
        Explore Industry Projects
        <ArrowRight className="h-4 w-4" />
      </Button>
    </section>
  );
}
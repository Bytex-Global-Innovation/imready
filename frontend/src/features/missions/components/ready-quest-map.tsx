import { Check, Lock } from "@/components/icons";
import { cn } from "@/lib/utils";

type StepState = "completed" | "active" | "locked";

interface QuestStep {
  number: number;
  letter: string;
  title: string;
  tag: string | null;
  subtitle: string;
  badgeClass: string;
  tagClass: string;
  lineClass: string;
}

const QUEST_STEPS: QuestStep[] = [
  {
    number: 1,
    letter: "R",
    title: "Reality",
    tag: "FOUNDATION",
    subtitle: "Stop guessing. Go see.",
    badgeClass: "bg-rose-500",
    tagClass: "text-rose-500",
    lineClass: "bg-rose-400",
  },
  {
    number: 2,
    letter: "E",
    title: "Engage",
    tag: "DISCOVERY",
    subtitle: "Meet people. Listen deeply.",
    badgeClass: "bg-emerald-500",
    tagClass: "text-emerald-600",
    lineClass: "bg-emerald-400",
  },
  {
    number: 3,
    letter: "A",
    title: "Analyze",
    tag: "INSIGHTS",
    subtitle: "Make sense of evidence.",
    badgeClass: "bg-amber-500",
    tagClass: "text-amber-600",
    lineClass: "bg-amber-400",
  },
  {
    number: 4,
    letter: "D",
    title: "Do",
    tag: "ACTION",
    subtitle: "Build, test and improve.",
    badgeClass: "bg-blue-600",
    tagClass: "text-blue-600",
    lineClass: "bg-blue-500",
  },
  {
    number: 5,
    letter: "Y",
    title: "Your Proof",
    tag: null,
    subtitle: "Show what you did • Finale",
    badgeClass: "bg-violet-500",
    tagClass: "text-violet-600",
    lineClass: "bg-violet-400",
  },
];

export function ReadyQuestMap({ currentMission }: { currentMission: number }) {
  const unlocked = Math.min(Math.max(currentMission, 1), QUEST_STEPS.length);

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        READY Quest Map
      </span>
      <p className="mt-2 text-xs text-muted">
        {unlocked} of {QUEST_STEPS.length} Milestones Unlocked
      </p>

      <ol className="mt-4 flex flex-col gap-2">
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
              className={cn(
                "relative flex items-start gap-3 rounded-xl border px-3 py-3",
                state === "active"
                  ? "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20"
                  : "border-transparent",
                state === "locked" && "opacity-60",
              )}
            >
              {/* Connector line from this badge down to the next one */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[32px] left-[31px] w-0.5 rounded-full",
                    state === "completed" ? step.lineClass : "bg-border",
                  )}
                  style={{ height: "calc(100% + 0.625rem)" }}
                />
              ) : null}

              <span className="relative z-10 shrink-0">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold",
                    state === "locked"
                      ? "bg-brand-100 text-muted"
                      : cn(step.badgeClass, "text-white shadow-sm"),
                  )}
                >
                  {step.letter}
                </span>
                
               
                {state === "locked" ? (
                  <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-muted">
                    <Lock className="h-2 w-2" />
                  </span>
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      state === "locked" ? "text-muted" : "text-foreground",
                    )}
                  >
                    {step.title}
                    {state === "active" ? (
                      <span className="ml-1.5 text-[11px] font-semibold text-blue-600">
                        (In Play)
                      </span>
                    ) : null}
                    {state === "completed" && step.tag ? (
                      <span
                        className={cn(
                          "ml-1.5 text-[10px] font-semibold tracking-wider",
                          step.tagClass,
                        )}
                      >
                        [{step.tag}]
                      </span>
                    ) : null}
                  </p>
                  {state === "active" ? (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold tracking-wider whitespace-nowrap text-blue-700 uppercase">
                      Mission {step.number}
                    </span>
                  ) : null}
                  {state === "locked" ? (
                    <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[9px] font-bold tracking-wider whitespace-nowrap text-muted uppercase">
                      Stage Locked
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-muted">{step.subtitle}</p>

                {state === "active" ? (
                 <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700">
  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
  Active Stage
</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
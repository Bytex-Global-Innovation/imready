const JOURNEY_STEPS = [
  {
    title: "Foundation",
    description: "Build the core skills industry expects.",
    tag: "Skills",
  },
  {
    title: "Industry Projects",
    description: "Deliver real industry projects, reviewed by working mentors.",
    tag: "Verified portfolio",
  },
  {
    title: "Paid Industry Projects",
    description: "Get rewarded for work that meets industry standards.",
    tag: "Income",
  },
] as const;

export function JourneyCard() {
  return (
    <div className="mx-auto w-full max-w-md rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Your ImReady journey
        </h2>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
          {JOURNEY_STEPS.length} steps
        </span>
      </div>

      <ol className="mt-5">
        {JOURNEY_STEPS.map((step, index) => {
          const isLast = index === JOURNEY_STEPS.length - 1;
          return (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                {!isLast ? (
                  <span className="mt-1 w-0.5 flex-1 rounded-full bg-brand-100" aria-hidden />
                ) : null}
              </div>
              <div className={isLast ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-6"}>
                <p className="font-display text-base font-bold text-foreground">
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-muted">{step.description}</p>
                <span className="mt-2 inline-block rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-primary">
                  {step.tag}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted">Classroom learner</span>
          <span className="text-primary">Industry professional</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-primary to-blue-400" />
        <p className="mt-4 text-center text-xs text-muted">
          Every step is mentor-guided and portfolio-backed.
        </p>
      </div>
    </div>
  );
}


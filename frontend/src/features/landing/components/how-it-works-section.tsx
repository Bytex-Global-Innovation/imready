import { HOW_IT_WORKS_STEPS, ROUTES } from "@/constants";
import { Button, Card, SectionLabel } from "@/components/ui";

function LightningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.835l-1.293 6.152a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.835l1.568-6.093z" />
    </svg>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel showAccent={false}>How It Works</SectionLabel>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple to join.{" "}
            <span className="text-brand-600">Structured to build.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            College gives you the foundation. IMReady gives you the proof. One
            process, guided every step.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-brand-200 lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <li key={step.step} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-500 bg-white shadow-sm">
                  <span className="font-display text-lg font-bold text-brand-600">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <Card className="mt-14 flex flex-col items-start gap-6 border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50">
              <LightningIcon className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Want to skip the wait?
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted sm:max-w-md">
                Unlock any stage instantly through the ByteX program instead of
                waiting on assignment review.
              </p>
            </div>
          </div>
          <Button href={ROUTES.bytex} className="w-full shrink-0 sm:w-auto">
            Unlock with ByteX
            <LightningIcon className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </section>
  );
}

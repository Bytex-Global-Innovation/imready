import {
  Building2,
  Check,
  Rocket,
  Star,
  X,
} from "@/components/icons";
import { GAP_SECTION } from "@/constants/landing";

export function GapSection() {
  const { traditional, imready, conclusion } = GAP_SECTION;

  return (
    <section id="gap" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-border bg-surface-alt px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-hero-accent">
            {GAP_SECTION.eyebrow}
          </p>

          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            {GAP_SECTION.title}{" "}
            <span className="text-hero-accent">{GAP_SECTION.titleAccent}</span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            {GAP_SECTION.description}
          </p>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch md:gap-8">
            <article className="rounded-2xl border border-muted/40 bg-surface-alt p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-hero-body shadow-sm">
                  <Building2 size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-hero-body">
                  {traditional.title}
                </h3>
              </div>

              <ul className="space-y-4">
                {traditional.steps.map((step) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-hero-body">
                    <Check
                      size={18}
                      strokeWidth={2.5}
                      className="shrink-0 text-muted"
                      aria-hidden="true"
                    />
                    <span>{step}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm font-semibold text-red-600">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50">
                    <X size={14} strokeWidth={2.75} aria-hidden="true" />
                  </span>
                  <span>{traditional.shock}</span>
                </li>
              </ul>
            </article>

            <div className="flex items-center justify-center py-4 md:py-0" aria-hidden="true">
              <div className="h-px w-full bg-border md:h-24 md:w-px" />
            </div>

            <article className="rounded-2xl border-2 border-brand-100 bg-brand-50/40 p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-hero-accent shadow-sm">
                  <Rocket size={18} strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-hero-accent">
                  {imready.title}
                </h3>
              </div>

              <ul className="space-y-4">
                {imready.steps.map((step) => (
                  <li
                    key={step}
                    className="flex items-center gap-3 text-sm font-medium text-hero-heading"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hero-accent text-white">
                      <Check size={14} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-surface-alt p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-hero-accent shadow-sm">
              <Star size={20} strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-hero-heading sm:text-2xl">
                {conclusion.heading}
              </h3>
              <p className="mt-1 text-base text-hero-body sm:text-lg">
                {conclusion.body}{" "}
                <span className="font-semibold text-hero-accent">
                  {conclusion.accent}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

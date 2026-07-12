import { BYTEX_HOW_IT_WORKS } from "@/constants/bytex";

export function HowBytexWorksSection() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-hero-heading sm:text-[2rem] sm:leading-10 sm:tracking-[-0.01em]">
          {BYTEX_HOW_IT_WORKS.title}
        </h2>
        <p className="max-w-md text-base leading-6 text-foreground/80">
          {BYTEX_HOW_IT_WORKS.subtitle}
        </p>
      </div>

      <div className="relative pt-6 md:pt-0">
        <div
          className="absolute left-[15%] right-[15%] top-7 hidden h-0.5 bg-border md:block"
          aria-hidden="true"
        />

        <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
          {BYTEX_HOW_IT_WORKS.steps.map((step) => (
            <li
              key={step.step}
              className="relative flex flex-col items-center gap-3 text-center"
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-700 bg-hero shadow-sm">
                <span className="font-display text-xl font-bold text-brand-700">
                  {step.step}
                </span>
              </div>
              <h3 className="pt-3 font-display text-xl font-semibold leading-8 text-hero-heading sm:text-2xl">
                {step.title}
              </h3>
              <p className="max-w-[250px] text-sm leading-5 text-foreground/80">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

import Image from "next/image";
import { PLATFORM_STATS, ROUTES } from "@/constants";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="overflow-x-hidden bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-6 xl:gap-10">
          <div className="space-y-6 lg:max-w-xl lg:space-y-8">
            <h1 className="font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-hero-heading sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              Before others even settle into,{" "}
              <span className="text-hero-accent">college.</span>
            </h1>
            <p className="text-base leading-[1.7] text-hero-body sm:text-lg">
              IMReady connects college students to real industry projects, working
              mentors, and a verified portfolio — before Semester 3. The students who
              start in Year 1 are the ones who enter placements with something to show.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button
                size="lg"
                href={ROUTES.signupStep(1)}
              >
                Start Your Industry Journey
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href={ROUTES.bytex}
                className="border-border/80 bg-white text-hero-heading shadow-sm hover:bg-hero"
              >
                Unlock your journey via bytex
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>

          <div
            id="journey"
            className="relative flex w-full items-center justify-center lg:justify-end"
          >
            <Image
              src="/hero-section.png"
              alt="Five-step journey from college learning to placement ready: real projects, mentor review, portfolio building, and career readiness."
              width={927}
              height={461}
              priority
              className={cn(
                "h-auto w-full max-w-none object-contain",
                "lg:max-w-[115%] lg:translate-x-2 xl:max-w-[120%] xl:translate-x-4",
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <div
        className="border-y border-border/60 bg-surface-alt"
        aria-label="Platform statistics"
      >
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {PLATFORM_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-6 py-8 text-center sm:py-10"
            >
              <dt className="font-display text-4xl font-bold text-hero-accent sm:text-5xl">
                {stat.value}
              </dt>
              <dd className="mt-2 text-sm font-medium text-hero-body">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

import Image from "next/image";
import { BYTEX_HERO } from "@/constants";
import { Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

export function BytexHeroSection() {
  return (
    <section className="overflow-x-hidden">
      <div
        className={cn(
          "flex w-full flex-col items-stretch gap-8 rounded-xl border border-border bg-surface-alt p-6 shadow-sm",
          "sm:gap-10 sm:p-8",
          "lg:min-h-[498px] lg:flex-row lg:items-center lg:gap-12 lg:p-12",
        )}
      >
        <div className="flex w-full flex-col justify-center gap-4 lg:w-[542px] lg:max-w-[542px] lg:shrink-0">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-hero-heading sm:text-4xl lg:text-[3rem] lg:leading-[3.5rem]">
            {BYTEX_HERO.title}
          </h1>
          <p className="max-w-[672px] text-base leading-7 text-foreground/80 lg:text-lg lg:leading-7">
            {BYTEX_HERO.description}
          </p>
          <div className="pt-2 lg:pt-4">
            <Button
              href={BYTEX_HERO.primaryAction.href}
              className="h-11 bg-[#153a75] px-6 text-white shadow-sm hover:bg-[#153a75]/90 focus-visible:ring-[#153a75]"
            >
              {BYTEX_HERO.primaryAction.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[544px] shrink-0 lg:mx-0 lg:h-[400px] lg:w-[544px]">
          <div className="flex h-full min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-border bg-hero sm:min-h-[300px] lg:min-h-[400px]">
            <Image
              src="/bytex-hero-visual.png"
              alt="Bytex device with a glowing screen on a soft lavender background"
              width={544}
              height={400}
              className="h-full w-full object-contain object-center p-4 sm:p-6"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

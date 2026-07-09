import Image from "next/image";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui";

export function HeroSection() {
  return (
    <section className="overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:py-18">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div className="space-y-6 lg:max-w-[560px] lg:space-y-8">
            <h1 className="font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-hero-heading sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              Before others even settle into,{" "}
              <span className="text-hero-accent">college.</span>
            </h1>
            <p className="text-base leading-[1.7] text-hero-body sm:text-lg">
              IMReady connects college students to real industry projects, working
              mentors, and a verified portfolio — before Semester 3. The students who
              start in Year 1 are the ones who enter placements with something to show.
            </p>
            <div className="pt-1">
              <Button size="lg" href={ROUTES.signupStep(1)}>
                Start Your Industry Journey
              </Button>
            </div>
          </div>

          <div className="relative min-w-0">
            <div
              className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(243,244,255,0.92)_0%,transparent_72%)]"
              aria-hidden="true"
            />

            <figure className="relative m-0 w-full lg:ml-auto lg:max-w-[760px]">
              <Image
                src="/hero-section.png"
                alt="Five-step journey from college learning to placement ready: real projects, mentor review, portfolio building, and career readiness."
                width={1365}
                height={1001}
                priority
                quality={95}
                className="h-auto w-full object-contain object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 50vw"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

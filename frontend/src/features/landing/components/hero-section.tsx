import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:py-18">
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <h1 className="order-1 font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-hero-heading sm:text-5xl lg:col-start-1 lg:max-w-[560px] lg:text-[3.25rem] xl:text-[3.5rem]">
            Before others even settle into,{" "}
            <span className="text-hero-accent">college.</span>
          </h1>

          <p className="order-2 text-base leading-[1.7] text-hero-body sm:text-lg lg:col-start-1 lg:max-w-[560px]">
            ImReady connects college students to real industry projects, working
            mentors, and a verified portfolio — before Semester 3. The students who
            start in Year 1 are the ones who enter placements with something to show.
          </p>

          <div className="relative order-3 min-w-0 lg:order-none lg:col-start-2 lg:row-span-4 lg:row-start-1">
            <div
              className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 bg-[radial-gradient(ellipse_at_center,rgb(243_244_255_/_0.92)_0%,transparent_72%)]"
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

          <div className="order-4 pt-1 lg:col-start-1 lg:max-w-[560px]">
            <Button size="lg" href={ROUTES.signup}>
              Start Your Industry Journey
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

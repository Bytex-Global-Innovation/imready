"use client";

import { useEffect, useRef } from "react";
import { PROJECT_SHOWCASE_ITEMS, ROUTES } from "@/constants";
import { Button, SectionLabel } from "@/components/ui";
import { cn } from "@/lib/utils";

type DomainTone = (typeof PROJECT_SHOWCASE_ITEMS)[number]["domainTone"];

function domainToneClass(_tone: DomainTone): string {
  return "text-hero-accent";
}

function ProjectCard({
  domain,
  title,
  meta,
  domainTone,
}: (typeof PROJECT_SHOWCASE_ITEMS)[number]) {
  return (
    <article className="w-[220px] shrink-0 rounded-xl border border-border bg-white px-4 py-3.5 transition-colors hover:border-border/80 sm:w-[240px]">
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          domainToneClass(domainTone),
        )}
      >
        {domain}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-hero-heading">{title}</h3>
      <p className="mt-1 text-xs text-hero-body">{meta}</p>
    </article>
  );
}

export function ProjectShowcaseSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationFrame = 0;

    const tick = () => {
      if (!pausedRef.current && track) {
        const halfWidth = track.scrollWidth / 2;
        offsetRef.current += 1.2;
        if (halfWidth > 0 && offsetRef.current >= halfWidth) {
          offsetRef.current = 0;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const tickerItems = [...PROJECT_SHOWCASE_ITEMS, ...PROJECT_SHOWCASE_ITEMS];

  return (
    <section id="projects" className="overflow-x-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel showAccent={false}>What students are building</SectionLabel>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl">
            Real projects. Real companies. Every domain.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            AI, data, engineering, finance, operations, product — ImReady projects span
            every stream and every year of college.
          </p>
        </div>
      </div>

      <div className="relative mt-10 sm:mt-12">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-hero to-transparent sm:w-20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-hero to-transparent sm:w-20"
          aria-hidden="true"
        />
        <div
          className="overflow-hidden"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div ref={trackRef} className="flex w-max gap-2.5 px-4 sm:px-6 lg:px-8">
            {tickerItems.map((project, index) => (
              <ProjectCard key={`${project.title}-${index}`} {...project} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-9 text-center sm:mt-10">
        <Button href={ROUTES.signupStep(1)} size="lg">
          Find your project brief
        </Button>
      </div>
    </section>
  );
}

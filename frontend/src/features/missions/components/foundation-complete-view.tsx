"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const PROJECT_PREVIEWS = [
  {
    tag: "EdTech / AI",
    title: "1. AI Box for Schools",
    problem:
      "How might schools give students and teachers practical access to AI tools without unpredictable per-user AI credits, recurring usage costs, or complex technical administration?",
    imageSrc: "/ai-box-for-schools.jpg",
    imageAlt: "Glowing digital brain over a network of connected nodes",
    imagePosition: "50% 40%",
  },
  {
    tag: "GenAI / Vision",
    title: "2. Old Photo Alive — Bring Photographs to Life",
    problem:
      "How might we transform a still photograph into a living memory, where people subtly move while preserving the authenticity of the original photograph?",
    imageSrc: "/old-photo-alive.jpg",
    imageAlt: "Snow-capped mountain peaks under a clear blue sky",
    imagePosition: "50% 70%",
  },
  {
    tag: "Mobility / IoT",
    title: "3. Traffic Management (No Fixed Signals)",
    problem:
      "How might traffic be managed safely and predictably at locations where permanent traffic signals are unavailable, temporarily disabled, or impractical?",
    imageSrc: "/traffic-management.jpg",
    imageAlt: "Dense lanes of traffic beneath overhead speed signs",
    imagePosition: "50% 50%",
  },
] as const;

export function FoundationCompleteView() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">
        Journey <span className="mx-1 text-brand-100">/</span> Stage 0: Foundation{" "}
        <span className="mx-1 text-brand-100">/</span>{" "}
        <span className="text-primary">Foundation Complete</span>
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            All 5 Missions Complete{" "}
            <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-primary">
              Foundation Verified
            </span>
          </p>
          <p className="text-xs text-muted">
            Official milestone assessment finalized &amp; registered on learner ledger.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-surface to-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-7 w-7" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
          Foundation Complete!
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted">
          You took curiosity and turned it into real evidence. That&apos;s a big step.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => router.push(ROUTES.dashboard)}>
            Join Guided Cohort
          </Button>
          <Button variant="secondary" onClick={() => router.push(ROUTES.projects)}>
            Explore Next Steps &amp; Industry Projects
          </Button>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-foreground">
        Get to work on these industry projects in the next stage
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PROJECT_PREVIEWS.map((project) => (
          <article
            key={project.title}
            className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-sm"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-100">
              <Image
                src={project.imageSrc}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                style={{ objectPosition: project.imagePosition }}
              />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <span className="w-fit rounded-full border border-border bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted">
                {project.tag}
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                {project.title}
              </h3>
              <p className="mt-3 text-[10px] font-bold tracking-wider text-foreground uppercase">
                Problem:
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{project.problem}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center pb-4">
        <Button onClick={() => router.push(ROUTES.projects)}>
          Explore projects in the next stage
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
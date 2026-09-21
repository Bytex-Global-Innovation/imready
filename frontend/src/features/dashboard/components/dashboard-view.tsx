"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Play,
  Star,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_USER,
  FOUNDATION_CARD,
  FOUNDATION_STEPS,
  INTRO_VIDEO,
  type FoundationStepIcon,
} from "@/constants/dashboard";
import { ActiveProjectDashboard } from "./active-project-dashboard";
import { AssessmentInstructionsModal } from "./assessment-instructions-modal";
import { JourneyPath } from "./journey-path";

const STEP_ICONS: Record<FoundationStepIcon, typeof CalendarDays> = {
  calendar: CalendarDays,
  check: CheckCircle2,
  document: FileText,
  chart: BarChart3,
  star: Star,
};

export function DashboardView() {
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const searchParams = useSearchParams();
  const hasActiveProject = searchParams.get("applied") === "true";

  if (hasActiveProject) {
    return <ActiveProjectDashboard />;
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Hi, {DASHBOARD_USER.name}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Welcome to your Stage 0 Explorer Dashboard.
        </p>
      </header>

      <JourneyPath />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-surface to-white p-5 sm:p-7 xl:col-span-3">
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            {FOUNDATION_CARD.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {FOUNDATION_CARD.description}
          </p>

          <ol className="mt-6 space-y-3.5">
            {FOUNDATION_STEPS.map((item) => {
              const Icon = STEP_ICONS[item.icon];
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="pt-1 text-sm leading-snug sm:text-base">
                    <span className="font-semibold text-foreground">
                      {item.step}
                    </span>{" "}
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.note ? (
                      <span className="text-muted"> {item.note}</span>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900">
            {FOUNDATION_CARD.callout}
          </p>

          <Button className="mt-6" onClick={() => setInstructionsOpen(true)}>
            {FOUNDATION_CARD.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>

        <section className="xl:col-span-2">
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            {INTRO_VIDEO.title}
          </h2>
          <div className="relative mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-surface">
            <button
              type="button"
              aria-label="Play introduction video"
              className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105"
            >
              <Play className="h-6 w-6 fill-current" />
            </button>
            <span className="absolute right-3 bottom-3 rounded bg-foreground/80 px-2 py-0.5 text-xs font-medium text-white">
              {INTRO_VIDEO.duration}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">{INTRO_VIDEO.caption}</p>
        </section>
      </div>

      <AssessmentInstructionsModal
        isOpen={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
      />
    </>
  );
}
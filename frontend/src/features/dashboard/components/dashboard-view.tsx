"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, Play } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  ASSESSMENT_CHECKLIST,
  DASHBOARD_USER,
  INTRO_VIDEO,
} from "@/constants/dashboard";
import { AssessmentInstructionsModal } from "./assessment-instructions-modal";
import { JourneyPath } from "./journey-path";

export function DashboardView() {
  const [instructionsOpen, setInstructionsOpen] = useState(false);

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
            Complete the assessment to move to the next stage.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            To unlock Stage 01 and gain access to premium curriculum and advanced
            analytics, you must first complete the foundational competency
            assessment. This helps us tailor your journey.
          </p>

          <ul className="mt-6 space-y-3">
            {ASSESSMENT_CHECKLIST.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm sm:text-base">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-brand-100" />
                )}
                <span
                  className={
                    item.done
                      ? "font-medium text-foreground"
                      : "text-muted"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <Button
            className="mt-7"
            onClick={() => setInstructionsOpen(true)}
          >
            Start Assessment
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

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Play,
  Star,
} from "@/components/icons";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { Button } from "@/components/ui/button";
import {
  FOUNDATION_CARD,
  FOUNDATION_STEPS,
  INTRO_VIDEO,
  type FoundationStepIcon,
} from "@/constants/dashboard";
import { ActiveProjectDashboard } from "./active-project-dashboard";
import { AssessmentInstructionsModal } from "./assessment-instructions-modal";
import { ROUTES } from "@/constants/routes";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
  hasFoundationProblemSelected,
  isFoundationComplete,
} from "@/features/missions/lib/mission-progress";
import { JourneyPath } from "./journey-path";

const STEP_ICONS: Record<FoundationStepIcon, typeof CalendarDays> = {
  calendar: CalendarDays,
  check: CheckCircle2,
  document: FileText,
  chart: BarChart3,
  star: Star,
};

type FoundationCtaMode = "start" | "continue" | "complete";

export function DashboardView() {
  const router = useRouter();
  const { student } = useStudentProfile();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [foundationCta, setFoundationCta] = useState<{
    mode: FoundationCtaMode;
    missionId: number;
  }>({ mode: "start", missionId: 1 });
  const searchParams = useSearchParams();
  const hasActiveProject = searchParams.get("applied") === "true";
  const displayName = student?.studentName?.trim() || "Explorer";

  useEffect(() => {
    ensureFoundationProgress()
      .then(() => {
        if (isFoundationComplete()) {
          setFoundationCta({ mode: "complete", missionId: 5 });
          return;
        }
        if (hasFoundationProblemSelected()) {
          setFoundationCta({
            mode: "continue",
            missionId: firstIncompleteMissionId(),
          });
          return;
        }
        setFoundationCta({ mode: "start", missionId: 1 });
      })
      .catch(() => {
        setFoundationCta({ mode: "start", missionId: 1 });
      });
  }, []);

  function handleFoundationCta() {
    if (foundationCta.mode === "complete") {
      router.push(ROUTES.foundationComplete);
      return;
    }
    if (foundationCta.mode === "continue") {
      router.push(ROUTES.mission(foundationCta.missionId));
      return;
    }
    setInstructionsOpen(true);
  }

  const foundationButtonLabel =
    foundationCta.mode === "continue"
      ? `Continue Mission ${foundationCta.missionId}`
      : foundationCta.mode === "complete"
        ? "View Foundation Summary"
        : FOUNDATION_CARD.cta;

  if (hasActiveProject) {
    return <ActiveProjectDashboard />;
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Hi, {displayName}
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

          <Button className="mt-6" onClick={handleFoundationCta}>
            {foundationButtonLabel}
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

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Star,
} from "@/components/icons";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { Button } from "@/components/ui/button";
import {
  FOUNDATION_CARD,
  FOUNDATION_STEPS,
  type FoundationStepIcon,
} from "@/constants/dashboard";
import { ActiveProjectDashboard } from "./active-project-dashboard";
import { AssessmentInstructionsModal } from "./assessment-instructions-modal";
import { FoundationIntroVideoView } from "./foundation-intro-video-view";
import { ROUTES } from "@/constants/routes";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
  hasFoundationProblemSelected,
  isFoundationComplete,
} from "@/features/missions/lib/mission-progress";
import {
  hasFoundationIntroStarted,
  hasFoundationIntroWatched,
  markFoundationIntroStarted,
  markFoundationIntroWatched,
} from "../lib/foundation-intro-progress";
import { IndustryExperienceView } from "@/features/stage2/components/industry-experience-view";
import { JourneyPath } from "./journey-path";

const STEP_ICONS: Record<FoundationStepIcon, typeof CalendarDays> = {
  calendar: CalendarDays,
  check: CheckCircle2,
  document: FileText,
  chart: BarChart3,
  star: Star,
};

type FoundationCtaMode = "start" | "continue" | "complete";
type DashboardScreen = "home" | "intro-video";

export function DashboardView() {
  const router = useRouter();
  const { student, foundationComplete: serverFoundationComplete, unpaidProjectsUnlocked } =
    useStudentProfile();
  const [screen, setScreen] = useState<DashboardScreen>("home");
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [introWatched, setIntroWatched] = useState(false);
  const [foundationCta, setFoundationCta] = useState<{
    mode: FoundationCtaMode;
    missionId: number;
  }>({ mode: "start", missionId: 1 });
  const [progressChecked, setProgressChecked] = useState(false);
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
          const missionId = firstIncompleteMissionId();
          setFoundationCta({ mode: "continue", missionId });
          // Journey already underway — skip landing and resume the mission.
          router.replace(ROUTES.mission(missionId));
          return;
        }

        setFoundationCta({ mode: "start", missionId: 1 });
        const started = hasFoundationIntroStarted();
        const watched = hasFoundationIntroWatched();
        setIntroWatched(watched);
        // Once Start was clicked, never return to the landing overview.
        if (started) {
          setScreen("intro-video");
        }
      })
      .catch(() => {
        setFoundationCta({ mode: "start", missionId: 1 });
        if (hasFoundationIntroStarted()) {
          setIntroWatched(hasFoundationIntroWatched());
          setScreen("intro-video");
        }
      })
      .finally(() => {
        setProgressChecked(true);
      });
  }, [router]);

  function handleFoundationCta() {
    if (foundationCta.mode === "continue") {
      router.push(ROUTES.mission(foundationCta.missionId));
      return;
    }
    markFoundationIntroStarted();
    setScreen("intro-video");
  }

  const foundationButtonLabel =
    foundationCta.mode === "continue"
      ? `Continue Objective ${foundationCta.missionId}`
      : FOUNDATION_CARD.cta;

  if (hasActiveProject) {
    return <ActiveProjectDashboard />;
  }

  const localFoundationComplete = foundationCta.mode === "complete";
  const foundationComplete =
    localFoundationComplete || serverFoundationComplete || unpaidProjectsUnlocked;

  if (progressChecked && foundationComplete) {
    return <IndustryExperienceView />;
  }

  // Mid-continue redirect in progress — avoid flashing the landing page.
  if (progressChecked && foundationCta.mode === "continue") {
    return <div className="py-10 text-center text-sm text-muted">Opening your objective…</div>;
  }

  if (!progressChecked) {
    return <div className="py-10 text-center text-sm text-muted">Loading your progress…</div>;
  }

  if (screen === "intro-video" || instructionsOpen) {
    return (
      <>
        {!instructionsOpen ? (
          <FoundationIntroVideoView
            initiallyWatched={introWatched}
            onWatched={() => {
              markFoundationIntroWatched();
              setIntroWatched(true);
            }}
            onNext={() => {
              markFoundationIntroWatched();
              setIntroWatched(true);
              setInstructionsOpen(true);
            }}
          />
        ) : null}

        <AssessmentInstructionsModal
          isOpen={instructionsOpen}
          onClose={() => {
            // Back from foundation setup only returns to the video screen.
            setInstructionsOpen(false);
            setScreen("intro-video");
          }}
        />
      </>
    );
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Hi, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Your journey to industry readiness starts here.
        </p>
      </header>

      <JourneyPath />

      <section className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-between gap-6 border-b border-border p-5 sm:p-7 lg:border-r lg:border-b-0">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Foundation stage
              </p>
              <h2 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                {FOUNDATION_CARD.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                {FOUNDATION_CARD.description}
              </p>
            </div>

            <div>
              <p className="mb-3 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                {FOUNDATION_CARD.callout}
              </p>
              <Button onClick={handleFoundationCta} className="w-full sm:w-auto sm:min-w-[11rem]">
                {foundationButtonLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-2 text-xs text-muted">
                You&apos;ll watch a short intro video before Foundation begins.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface to-white p-5 sm:p-7">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              What you&apos;ll do
            </p>
            <ol className="mt-4 space-y-3.5">
              {FOUNDATION_STEPS.map((item) => {
                const Icon = STEP_ICONS[item.icon];
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="pt-1 text-sm leading-snug">
                      <span className="font-semibold text-foreground">{item.step}</span>{" "}
                      <span className="font-medium text-foreground">{item.label}</span>
                      {item.note ? <span className="text-muted"> {item.note}</span> : null}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

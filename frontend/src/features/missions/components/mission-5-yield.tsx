"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import { MissionFooterNav, PresentationVideoLinkField } from "./mission-ui";
import { FoundationMissionShell } from "./foundation-mission-shell";
import {
  evidenceConfigText,
  questionHelper,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
} from "../lib/foundation-journey";
import {
  isAllowedPresentationVideoUrl,
  validatePresentationVideoUrl,
} from "../lib/presentation-video-url";

const MISSION_ID = 5;
const mission = getMission(MISSION_ID);

const OBJECTIVE_STEPS = [
  "Add a YouTube or Google Drive video link as final proof.",
  "Describe any improvements you made after testing.",
  "Explain how you validated the fix with real people.",
  "Reflect on the impact — what changed for them?",
];

export function Mission5Yield() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const router = useRouter();
  const { refresh } = useStudentProfile();
  const [validation, setValidation] = useState("");
  const [impact, setImpact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [presentationVideoUrl, setPresentationVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const [improvements, setImprovements] = useState("");

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setPresentationVideoUrl((record.answers.presentationVideoUrl as string) ?? "");
      setImprovements((record.answers.improvements as string) ?? "");
      setValidation((record.answers.validation as string) ?? "");
      setImpact((record.answers.impact as string) ?? "");
      setIsSubmitted(Boolean(record.completed));
      setHydrated(true);
    });
  }, []);

  const videoValid = isAllowedPresentationVideoUrl(presentationVideoUrl);
  const canComplete =
    videoValid &&
    improvements.trim().length > 0 &&
    validation.trim().length > 0 &&
    impact.trim().length > 0;
  const locked = isSubmitted;

  async function handleSubmit() {
    if (!canComplete || isSubmitting || locked) return;
    if (!presentationVideoUrl.trim()) {
      setVideoError("Add a YouTube or Google Drive video link.");
      return;
    }
    const check = validatePresentationVideoUrl(presentationVideoUrl);
    if (!check.ok) {
      setVideoError(check.message);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setVideoError(null);
    try {
      const answers = {
        presentationVideoUrl: check.normalized,
        improvements,
        validation,
        impact,
      } as Record<string, string>;
      await saveMissionDraft(MISSION_ID, answers, null);
      const result = await completeMission(MISSION_ID, answers, null);
      setIsSubmitted(true);
      if (result.foundationComplete) {
        await refresh();
      }
      setShowVerificationPopup(true);
      setRedirectSeconds(5);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit this objective. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!showVerificationPopup) return;
    setRedirectSeconds(5);
    const tick = window.setInterval(() => {
      setRedirectSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    const redirect = window.setTimeout(() => {
      router.push(ROUTES.foundationComplete);
    }, 5000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, [showVerificationPopup, router]);

  if (!hydrated || !journeyReady) {
    return <div className="py-12 text-center text-sm text-muted">Loading objective…</div>;
  }

  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;
  const sectionTitle =
    evidenceConfigText(journeyConfig, "sectionTitle", "Show your final proof") ??
    "Show your final proof";
  const videoHelper =
    evidenceConfigText(
      journeyConfig,
      "videoLinkHelper",
      questionHelper(
        journeyConfig,
        "presentationVideoUrl",
        "Paste a YouTube or Google Drive link showing your final proof and impact.",
      ),
    ) ??
    questionHelper(
      journeyConfig,
      "presentationVideoUrl",
      "Paste a YouTube or Google Drive link showing your final proof and impact.",
    );

  return (
    <>
      {showVerificationPopup ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b1c30]/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="foundation-verification-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-[11px] font-semibold tracking-wider text-[#153a75] uppercase">
              Foundation submitted
            </p>
            <h2
              id="foundation-verification-title"
              className="mt-2 text-xl font-bold tracking-tight text-[#0b1c30]"
            >
              You have completed the Foundation stage
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#42474f]">
              Your submission has been sent to ImReady admins for review. Please wait{" "}
              <span className="font-semibold text-[#153a75]">24–48 hours</span> for verification.
              You will be notified whether you passed this stage properly or not.
            </p>
            <p className="mt-4 text-xs font-medium text-[#737780]">
              Redirecting to Stage 2 Industry Experience in {redirectSeconds}s…
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e5eeff]">
              <div
                className="h-full rounded-full bg-[#153a75] transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - redirectSeconds) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <FoundationMissionShell
        current="Your Proof"
        missionId={MISSION_ID}
        title={mission.title}
        subtitle={mission.subtitle}
        mainTitle={sectionTitle}
        mainSubtitle="Package the proof that your fix actually helped."
        howToSubtitle="Numbers convince more than adjectives — show what changed."
        howToSteps={OBJECTIVE_STEPS}
        tipAdvisor={tipAdvisor}
        tipQuote={tipQuote}
        main={
          <>
            <PresentationVideoLinkField
              value={presentationVideoUrl}
              onChange={(value) => {
                setPresentationVideoUrl(value);
                if (videoError) setVideoError(null);
              }}
              label={questionText(journeyConfig, "presentationVideoUrl", "Impact video link")}
              helper={videoHelper}
              placeholder={questionPlaceholder(
                journeyConfig,
                "presentationVideoUrl",
                "https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view",
              )}
              error={videoError}
              disabled={locked}
            />

            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
                Improvements from the Do stage
              </label>
              <textarea
                value={improvements}
                onChange={(event) => setImprovements(event.target.value)}
                rows={2}
                placeholder="e.g. Made the numbers larger after students struggled to read them..."
                disabled={locked}
                readOnly={locked}
                className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
                {questionText(journeyConfig, "validation", "How did you validate it?")}
              </label>
              <textarea
                value={validation}
                onChange={(event) => setValidation(event.target.value)}
                rows={2}
                placeholder={questionPlaceholder(
                  journeyConfig,
                  "validation",
                  "e.g. Checked back with 3 students who used your solution...",
                )}
                disabled={locked}
                readOnly={locked}
                className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">
                {questionText(journeyConfig, "impact", "What impact did it have?")}
              </label>
              <textarea
                value={impact}
                onChange={(event) => setImpact(event.target.value)}
                rows={2}
                placeholder={questionPlaceholder(
                  journeyConfig,
                  "impact",
                  "What changed for them because of your fix?",
                )}
                disabled={locked}
                readOnly={locked}
                className="w-full resize-none rounded-[var(--radius-card)] border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
              />
            </div>

            {submitError ? (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}
          </>
        }
        footer={
          <MissionFooterNav
            flush
            onPrevious={() => router.push(ROUTES.mission(4))}
            previousLabel="Back to Do"
            onSubmit={handleSubmit}
            submitDisabled={!canComplete}
            isSubmitting={isSubmitting}
            isSubmitted={locked}
            onNext={locked ? () => router.push(ROUTES.foundationComplete) : undefined}
            nextLabel="Continue to Stage 2"
          />
        }
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeMission, ensureFoundationProgress, getMissionRecord, saveMissionDraft } from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  AutosaveStatus,
  MissionBreadcrumb,
  MissionFooterNav,
  MissionLayout,
  MissionProgressPanel,
  SelectedProblemBanner,
  TipFromReady,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import {
  questionHelper,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
  useSelectedProblemText,
} from "../lib/foundation-journey";

const MISSION_ID = 1;
const mission = getMission(MISSION_ID);

const MISSION_1_OBJECTIVE =
  "OBJECTIVE OF THIS MISSION\n" +
  "Observe your surroundings — college, home, shops, or public places.\n\n" +
  "1. Identify one moment where someone faces frustration, waiting, confusion, or repeated effort.\n" +
  "2. Understand who is facing the problem and what they are trying to do.\n" +
  "3. Document what happened and why it is a problem.\n" +
  "4. Submit your observation with the situation, person affected, and difficulty faced.\n\n" +
  "Remember: Identify the problem first. Don't jump to solutions yet!";

export function Mission1Reality() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const selectedProblemText = useSelectedProblemText();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setCaption((record.answers.caption as string) ?? "");
      setReflection((record.answers.reflection as string) ?? "");
      setHydrated(true);
    });
  }, []);

  const reflectionWords = reflection.trim() ? reflection.trim().split(/\s+/).length : 0;
  const canComplete = caption.trim().length > 0 && reflection.trim().length > 0;

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await saveMissionDraft(MISSION_ID, { caption, reflection }, null);
      await completeMission(MISSION_ID, { caption, reflection }, null);
      router.push(ROUTES.missionComplete(MISSION_ID));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not submit this mission. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hydrated || !journeyReady) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  const sectionTitle = "Mission objective";
  const sectionDescription = MISSION_1_OBJECTIVE;
  const captionLabel = questionText(journeyConfig, "caption", "Short title / caption");
  const captionHelper = questionHelper(
    journeyConfig,
    "caption",
    "Keep it concise and clear about the friction trigger.",
  );
  const reflectionHelper = questionHelper(
    journeyConfig,
    "reflection",
    "A few lines about what surprised you. What stood out?",
  );
  const reflectionPlaceholder = questionPlaceholder(
    journeyConfig,
    "reflection",
    "Type your observation here...",
  );
  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel="Foundation" current="Mission 1: Reality" />}
      badge={<ActiveMissionBadge label={mission.activeBadgeLabel} />}
      title={mission.title}
      subtitle={mission.subtitle}
      headerRight={
        <MissionProgressPanel label="Mission 1 Progress" stepLabel="Step 1 of 2 (50%)" percent={50} nextLabel="Reflection & Debrief" />
      }
      main={
        <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-lg font-bold text-foreground">{sectionTitle}</h2>
          <p className="mt-1 text-sm whitespace-pre-line text-muted">{sectionDescription}</p>

          <div className="mt-5 space-y-1.5">
            <Label htmlFor="caption" required>
              {captionLabel}
            </Label>
            {captionHelper ? <p className="text-sm text-muted">{captionHelper}</p> : null}
            <Input
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="e.g. Long lunch queue at the canteen"
            />
          </div>

          <label className="mt-6 mb-2 flex items-center justify-between text-xs font-semibold tracking-wider text-muted uppercase">
            <span>Reflect on what you noticed</span>
          </label>
          <p className="mb-2 text-sm text-muted">{reflectionHelper}</p>
          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={4}
            placeholder={reflectionPlaceholder}
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2">
            <AutosaveStatus wordCount={reflectionWords} />
          </div>

          {submitError ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}

          <MissionFooterNav
            onPrevious={() => router.push(ROUTES.dashboard)}
            previousLabel="Back to Dashboard"
            onNext={handleComplete}
            nextLabel="Next: Reflection & Submit"
            nextDisabled={!canComplete}
            isSubmitting={isSubmitting}
          />
        </div>
      }
      sidebar={
        <>
          <SelectedProblemBanner statementText={selectedProblemText} />
          <TipFromReady advisorLabel={tipAdvisor} quote={tipQuote} />
          <ReadyQuestMap currentMission={MISSION_ID} />
        </>
      }
    />
  );
}

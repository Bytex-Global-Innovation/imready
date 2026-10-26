"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import {
  completeMission,
  ensureFoundationProgress,
  getMissionRecord,
  saveMissionDraft,
} from "../lib/mission-progress";
import {
  ActiveMissionBadge,
  MissionBreadcrumb,
  MissionFooterNav,
  MissionLayout,
  PresentationVideoLinkField,
  QuestionField,
  SelectedProblemBanner,
  TipFromReady,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import {
  evidenceConfigText,
  questionHelper,
  questionPlaceholder,
  questionText,
  useFoundationMissionConfig,
  useSelectedProblemText,
} from "../lib/foundation-journey";
import {
  isAllowedPresentationVideoUrl,
  validatePresentationVideoUrl,
} from "../lib/presentation-video-url";

const MISSION_ID = 4;
const mission = getMission(MISSION_ID);

export function Mission4Do() {
  const { config: journeyConfig, ready: journeyReady } = useFoundationMissionConfig(MISSION_ID);
  const selectedProblemText = useSelectedProblemText();
  const router = useRouter();
  const [presentationVideoUrl, setPresentationVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [respond, setRespond] = useState("");
  const [worked, setWorked] = useState("");
  const [didntWork, setDidntWork] = useState("");
  const [improve, setImprove] = useState("");
  const [implementation, setImplementation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureFoundationProgress().then(() => {
      const record = getMissionRecord(MISSION_ID);
      setPresentationVideoUrl((record.answers.presentationVideoUrl as string) ?? "");
      setDescription((record.answers.description as string) ?? "");
      setRespond((record.answers.respond as string) ?? "");
      setWorked((record.answers.worked as string) ?? "");
      setDidntWork((record.answers.didntWork as string) ?? "");
      setImprove((record.answers.improve as string) ?? "");
      setImplementation((record.answers.implementation as string) ?? "");
      setHydrated(true);
    });
  }, []);

  function buildAnswers() {
    return {
      presentationVideoUrl: presentationVideoUrl.trim(),
      description,
      respond,
      worked,
      didntWork,
      improve,
      implementation,
    };
  }

  const videoValid = isAllowedPresentationVideoUrl(presentationVideoUrl);
  const checklist = [
    { label: "Add presentation video link (YouTube or Google Drive)", done: videoValid },
    { label: "Test it with real users", done: respond.trim().length > 0 },
    { label: "Observe what happens", done: worked.trim().length > 0 && didntWork.trim().length > 0 },
    { label: "Make one improvement", done: improve.trim().length > 0 },
    { label: "Plan how to implement the improvements", done: implementation.trim().length > 0 },
  ];
  const canComplete = checklist.every((item) => item.done) && description.trim().length > 0;

  async function handleComplete() {
    if (!canComplete || isSubmitting) return;
    const check = validatePresentationVideoUrl(presentationVideoUrl);
    if (!check.ok) {
      setVideoError(check.message);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setVideoError(null);
    try {
      const answers = buildAnswers();
      await saveMissionDraft(MISSION_ID, answers, null);
      await completeMission(MISSION_ID, answers, null);
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

  const tipAdvisor = journeyConfig?.tipAdvisorLabel ?? mission.tip.advisorLabel;
  const tipQuote = journeyConfig?.tipQuote ?? mission.tip.quote;
  const pageSubtitle =
    evidenceConfigText(journeyConfig, "pageSubtitle", mission.subtitle) ?? mission.subtitle;
  const sectionTitle =
    evidenceConfigText(journeyConfig, "sectionTitle", "Share your prototype presentation video") ??
    "Share your prototype presentation video";
  const sectionDescription =
    evidenceConfigText(
      journeyConfig,
      "sectionDescription",
      "Add a YouTube or Google Drive link to a short video showcasing what you built and tested.",
    ) ??
    "Add a YouTube or Google Drive link to a short video showcasing what you built and tested.";
  const reflectionSectionTitle =
    evidenceConfigText(
      journeyConfig,
      "reflectionSectionTitle",
      "Tell Us What Happened: Test Reflection",
    ) ?? "Tell Us What Happened: Test Reflection";
  const reflectionSectionDescription =
    evidenceConfigText(
      journeyConfig,
      "reflectionSectionDescription",
      "Document your real-world test results",
    ) ?? "Document your real-world test results";
  const improvementSectionTitle =
    evidenceConfigText(journeyConfig, "improvementSectionTitle", "Improvement Phase") ??
    "Improvement Phase";
  const improvementSectionDescription =
    evidenceConfigText(
      journeyConfig,
      "improvementSectionDescription",
      "Decide what to change and how you will make it happen",
    ) ?? "Decide what to change and how you will make it happen";
  const videoHelper =
    evidenceConfigText(
      journeyConfig,
      "videoLinkHelper",
      questionHelper(
        journeyConfig,
        "presentationVideoUrl",
        "Paste a YouTube or Google Drive link to your prototype or demo video.",
      ),
    ) ??
    questionHelper(
      journeyConfig,
      "presentationVideoUrl",
      "Paste a YouTube or Google Drive link to your prototype or demo video.",
    );

  return (
    <MissionLayout
      breadcrumb={<MissionBreadcrumb stageLabel=" Foundation" current="Active Mission" />}
      badge={<ActiveMissionBadge label={`${mission.activeBadgeLabel} · Mission 4 of 5`} />}
      title={mission.title}
      subtitle={pageSubtitle}
      headerRight={
        mission.frameworkPhaseLabel ? (
          <span className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-primary">
            {mission.frameworkPhaseLabel}
          </span>
        ) : undefined
      }
      main={
        <>
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">{sectionTitle}</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 1 of 3</span>
            </div>
            <p className="mt-1 text-sm text-muted">{sectionDescription}</p>
            <div className="mt-4">
              <PresentationVideoLinkField
                value={presentationVideoUrl}
                onChange={(value) => {
                  setPresentationVideoUrl(value);
                  if (videoError) setVideoError(null);
                }}
                label={questionText(journeyConfig, "presentationVideoUrl", "Presentation video link")}
                helper={videoHelper}
                placeholder={questionPlaceholder(
                  journeyConfig,
                  "presentationVideoUrl",
                  "https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view",
                )}
                error={videoError}
              />
            </div>
            <label className="mt-6 mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
              {questionText(journeyConfig, "description", "Describe your prototype")}
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder={questionPlaceholder(
                journeyConfig,
                "description",
                "We tried a simple token board at the counter...",
              )}
              className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {questionHelper(journeyConfig, "description") ? (
              <p className="mt-1.5 text-xs text-muted">
                {questionHelper(journeyConfig, "description")}
              </p>
            ) : null}
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">{reflectionSectionTitle}</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 2 of 3</span>
            </div>
            <p className="mt-1 mb-4 text-sm text-muted">{reflectionSectionDescription}</p>

            <QuestionField
              index={1}
              question={questionText(
                journeyConfig,
                "respond",
                "How did people respond when you tested it?",
              )}
              helper={questionHelper(journeyConfig, "respond")}
              placeholder={questionPlaceholder(journeyConfig, "respond", "Students said...")}
              value={respond}
              onChange={setRespond}
              done={respond.trim().length > 0}
            />
            <QuestionField
              index={2}
              question={questionText(journeyConfig, "worked", "What worked?")}
              helper={questionHelper(journeyConfig, "worked")}
              placeholder={questionPlaceholder(
                journeyConfig,
                "worked",
                "Wait time felt shorter because...",
              )}
              value={worked}
              onChange={setWorked}
              done={worked.trim().length > 0}
            />
            <QuestionField
              index={3}
              question={questionText(journeyConfig, "didntWork", "What didn't work?")}
              helper={questionHelper(journeyConfig, "didntWork")}
              placeholder={questionPlaceholder(journeyConfig, "didntWork", "Some students still...")}
              value={didntWork}
              onChange={setDidntWork}
              done={didntWork.trim().length > 0}
            />
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">{improvementSectionTitle}</h2>
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">Step 3 of 3</span>
            </div>
            <p className="mt-1 mb-4 text-sm text-muted">{improvementSectionDescription}</p>

            <QuestionField
              index={1}
              question={questionText(
                journeyConfig,
                "improve",
                "What is one improvement you would make next?",
              )}
              helper={questionHelper(journeyConfig, "improve")}
              placeholder={questionPlaceholder(journeyConfig, "improve", "Next time I would...")}
              value={improve}
              onChange={setImprove}
              done={improve.trim().length > 0}
            />
            <QuestionField
              index={2}
              question={questionText(
                journeyConfig,
                "implementation",
                "How will you implement these improvements?",
              )}
              helper={questionHelper(journeyConfig, "implementation")}
              placeholder={questionPlaceholder(
                journeyConfig,
                "implementation",
                "Describe the steps, tools, or changes you will use to put your improvement into action...",
              )}
              value={implementation}
              onChange={setImplementation}
              done={implementation.trim().length > 0}
            />

            {submitError ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {submitError}
              </p>
            ) : null}

            <MissionFooterNav
              onPrevious={() => router.push(ROUTES.mission(3))}
              previousLabel="Mission 3: Analyze"
              onNext={handleComplete}
              nextLabel="Complete Mission 4"
              nextDisabled={!canComplete}
              isSubmitting={isSubmitting}
            />
          </div>
        </>
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
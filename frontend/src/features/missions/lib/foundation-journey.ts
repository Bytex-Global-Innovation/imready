import { useEffect, useState } from "react";
import { getSelectedProblemStatementDisplay } from "./mission-progress";
import { foundationApi, type FoundationJourneyContent } from "@/lib/foundation-api";

export type MissionQuestionConfig = {
  answerKey: string;
  question?: string;
  label?: string;
  helper?: string;
  placeholder?: string;
};

export type MissionJourneyConfig = {
  missionId: number;
  tipAdvisorLabel: string;
  tipQuote: string;
  analyzeContextText: string | null;
  patternTagOptions: string[] | null;
  whyLayerLabels: { key: string; label: string }[] | null;
  questions: MissionQuestionConfig[];
  evidenceConfig: Record<string, string> | null;
};

let cachedJourney: FoundationJourneyContent | null = null;
let journeyPromise: Promise<FoundationJourneyContent> | null = null;

export function clearFoundationJourneyCache() {
  cachedJourney = null;
  journeyPromise = null;
}

export function setFoundationJourneyCache(content: FoundationJourneyContent) {
  cachedJourney = content;
}

export async function ensureFoundationJourneyContent(): Promise<FoundationJourneyContent> {
  if (cachedJourney) return cachedJourney;
  if (journeyPromise) return journeyPromise;

  journeyPromise = foundationApi.getJourneyContent().then((content) => {
    cachedJourney = content;
    return content;
  }).finally(() => {
    journeyPromise = null;
  });

  return journeyPromise;
}

export function getCachedFoundationJourney(): FoundationJourneyContent | null {
  return cachedJourney;
}

export function getMissionJourneyConfig(
  content: FoundationJourneyContent | null,
  missionId: number,
): MissionJourneyConfig | null {
  if (!content?.missions) return null;
  const raw = content.missions[String(missionId)] ?? content.missions[missionId];
  if (!raw) return null;
  return {
    missionId,
    tipAdvisorLabel: raw.tipAdvisorLabel,
    tipQuote: raw.tipQuote,
    analyzeContextText: raw.analyzeContextText,
    patternTagOptions: raw.patternTagOptions,
    whyLayerLabels: raw.whyLayerLabels,
    questions: raw.questions ?? [],
    evidenceConfig: raw.evidenceConfig,
  };
}

export function questionByKey(
  config: MissionJourneyConfig | null,
  answerKey: string,
): MissionQuestionConfig | undefined {
  return config?.questions.find((q) => q.answerKey === answerKey);
}

export function questionText(
  config: MissionJourneyConfig | null,
  answerKey: string,
  fallback: string,
): string {
  const q = questionByKey(config, answerKey);
  return q?.question || q?.label || fallback;
}

export function questionHelper(
  config: MissionJourneyConfig | null,
  answerKey: string,
  fallback?: string,
): string | undefined {
  const q = questionByKey(config, answerKey);
  return q?.helper || fallback;
}

export function questionPlaceholder(
  config: MissionJourneyConfig | null,
  answerKey: string,
  fallback?: string,
): string | undefined {
  const q = questionByKey(config, answerKey);
  return q?.placeholder || fallback;
}

export function evidenceConfigText(
  config: MissionJourneyConfig | null,
  key: string,
  fallback?: string,
): string | undefined {
  const value = config?.evidenceConfig?.[key];
  return value != null && String(value).trim() ? String(value) : fallback;
}

export function whyLayersFromConfig(
  config: MissionJourneyConfig | null,
  fallback: { key: string; label: string }[],
): { key: string; label: string }[] {
  if (config?.whyLayerLabels?.length) return config.whyLayerLabels;
  return fallback;
}

export function patternTagsFromConfig(
  config: MissionJourneyConfig | null,
  fallback: string[],
): string[] {
  if (config?.patternTagOptions?.length) return config.patternTagOptions;
  return fallback;
}

/** Selected foundation problem text for mission sidebars (from journey API / progress cache). */
export function useSelectedProblemText(): string | null {
  const [text, setText] = useState<string | null>(() => {
    const cached = getCachedFoundationJourney()?.selectedProblemStatement?.statementText;
    if (cached) return cached;
    return getSelectedProblemStatementDisplay()?.text ?? null;
  });

  useEffect(() => {
    let cancelled = false;
    ensureFoundationJourneyContent()
      .then((content) => {
        if (!cancelled) {
          setText(content.selectedProblemStatement?.statementText ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setText(getSelectedProblemStatementDisplay()?.text ?? null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return text;
}

export function useFoundationMissionConfig(missionId: number) {
  const [config, setConfig] = useState<MissionJourneyConfig | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureFoundationJourneyContent()
      .then((content) => {
        if (!cancelled) {
          setConfig(getMissionJourneyConfig(content, missionId));
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [missionId]);

  return { config, ready };
}

"use client";

import {
  MissionBreadcrumb,
  SelectedProblemBanner,
  TipFromReady,
} from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";
import { useSelectedProblemText } from "../lib/foundation-journey";

export function FoundationMissionShell({
  current,
  missionId,
  title,
  subtitle,
  mainTitle,
  mainSubtitle,
  howToTitle = "How to run this stage",
  howToSubtitle,
  howToSteps,
  tipAdvisor,
  tipQuote,
  main,
  footer,
}: {
  current: string;
  missionId: number;
  title: string;
  subtitle: string;
  mainTitle: string;
  mainSubtitle?: string;
  howToTitle?: string;
  howToSubtitle: string;
  howToSteps: string[];
  tipAdvisor: string;
  tipQuote: string;
  main: React.ReactNode;
  footer: React.ReactNode;
}) {
  const selectedProblemText = useSelectedProblemText();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)]">
      <div className="grid shrink-0 items-start gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <MissionBreadcrumb stageLabel="Foundation" current={current} />
          <h1 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="lg:col-span-2 lg:-mt-5">
          <ReadyQuestMap currentMission={missionId} compact />
        </div>
      </div>

      <div className="shrink-0">
        <SelectedProblemBanner
          statementText={selectedProblemText}
          prominent
          compact
          tone="panel"
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-5 lg:overflow-hidden">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-sm lg:col-span-3">
          <div
            data-soft-scroll
            className="soft-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
          >
            <div>
              <h2 className="font-display text-base font-bold text-foreground">{mainTitle}</h2>
              {mainSubtitle ? (
                <p className="mt-0.5 text-xs text-muted">{mainSubtitle}</p>
              ) : null}
            </div>
            {main}
          </div>
        </section>

        <aside
          data-soft-scroll
          className="soft-scrollbar flex min-h-0 flex-col gap-3 lg:col-span-2 lg:overflow-y-auto"
        >
          <TipFromReady advisorLabel={tipAdvisor} quote={tipQuote} />
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
            <h2 className="font-display text-sm font-bold text-foreground">{howToTitle}</h2>
            <p className="mt-0.5 text-xs text-muted">{howToSubtitle}</p>
            <ol className="mt-3 space-y-2">
              {howToSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-2.5 text-xs leading-relaxed text-foreground sm:text-sm"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-background/95 py-3 backdrop-blur-sm lg:static lg:bg-transparent lg:py-0 lg:pt-1 lg:backdrop-blur-none">
        {footer}
      </div>
    </div>
  );
}

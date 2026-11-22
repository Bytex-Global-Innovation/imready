"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MISSIONS, MISSION_COMPLETE_CONTENT, getMission } from "@/constants/missions";
import { ROUTES } from "@/constants/routes";
import {
  firstIncompleteMissionId,
  isMissionAccessible,
} from "../lib/mission-progress";
import { MissionBreadcrumb } from "./mission-ui";
import { ReadyQuestMap } from "./ready-quest-map";

export function MissionCompleteView({ missionId }: { missionId: number }) {
  const router = useRouter();
  const mission = getMission(missionId);
  const content = MISSION_COMPLETE_CONTENT[missionId];
  const nextMission = MISSIONS.find((m) => m.id === missionId + 1);

  function goNext() {
    if (!nextMission) {
      router.push(ROUTES.foundationComplete);
      return;
    }
    if (!isMissionAccessible(nextMission.id)) {
      router.push(ROUTES.mission(firstIncompleteMissionId()));
      return;
    }
    router.push(ROUTES.mission(nextMission.id));
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid w-full items-start gap-4 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <MissionBreadcrumb
            stageLabel="Foundation"
            current={`${mission.letterWord} Complete`}
          />
          <div className="mt-2 flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Check className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Objective {missionId} complete
              </h1>
              <p className="mt-0.5 text-sm text-muted">{content.celebrationLine}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 lg:-mt-5">
          <ReadyQuestMap currentMission={Math.min(missionId + 1, MISSIONS.length)} compact />
        </div>
      </div>

      <section className="w-full rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6">
        {nextMission ? (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                Up next · Objective {nextMission.id} of 5
              </p>
              <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
                {nextMission.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{nextMission.subtitle}</p>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">
                What you&apos;ll do
              </p>
              <ol className="mt-3 space-y-2.5">
                {nextMission.whatYoullDo.map((step, index) => (
                  <li key={step} className="flex gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Foundation stage finished
            </h2>
            <p className="mt-2 text-sm text-muted">
              You&apos;re ready to move into Stage 2 Industry Experience.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <Button onClick={goNext} className="w-full sm:w-auto sm:min-w-[14rem]">
            {nextMission ? `Next: ${nextMission.letterWord}` : "Continue to Stage 2"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

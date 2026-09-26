"use client";

import { useSearchParams } from "next/navigation";
import {
  Play,
} from "@/components/icons";
import { DASHBOARD_USER, INTRO_VIDEO } from "@/constants/dashboard";
import { ActiveProjectDashboard } from "./active-project-dashboard";
import { JourneyPath } from "./journey-path";

export function DashboardView() {
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

      <div className="grid grid-cols-1 gap-6">
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
    </>
  );
}
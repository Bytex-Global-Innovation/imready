"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  READY_PHASES,
  READY_STEPPER,
  type ReadyPhase,
  type ReadyPhaseKey,
} from "@/constants/stage2-ready-framework";
import { ROUTES } from "@/constants/routes";
import { projectsApi, type ProjectTeam } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

type PillarTab = "task" | "examples" | "guide";

function storageKey(projectId: string) {
  return `imready:stage2:ready-tasks:${projectId}`;
}

function defaultChecks() {
  const map: Record<string, boolean> = {};
  for (const phase of READY_PHASES) {
    for (const task of phase.tasks) {
      map[task.id] = Boolean(task.defaultChecked);
    }
  }
  return map;
}

function statusLabel(status: string) {
  if (status === "active") return "Active Phase";
  if (status === "progress") return "In Progress";
  if (status === "upcoming") return "Upcoming";
  return "Locked";
}

export function Stage2ReadyFrameworkView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>(defaultChecks);
  const [pillarTabs, setPillarTabs] = useState<Record<ReadyPhaseKey, PillarTab>>({
    R: "task",
    E: "task",
    A: "task",
    D: "task",
    Y: "task",
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(detail.id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setChecks((prev) => ({ ...prev, ...parsed }));
    } catch {
      /* ignore corrupt storage */
    }
  }, [detail.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(detail.id), JSON.stringify(checks));
    } catch {
      /* ignore quota */
    }
    const timer = window.setTimeout(() => {
      void projectsApi
        .updateStageProgress(detail.id, {
          currentStage: "READY",
          checkpoints: { ready: checks },
        })
        .catch(() => {
          /* preview / offline ok */
        });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [checks, detail.id]);

  const doneCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks],
  );
  const totalTasks = useMemo(
    () => READY_PHASES.reduce((sum, p) => sum + p.tasks.length, 0),
    [],
  );
  const pct = Math.round((doneCount / Math.max(1, totalTasks)) * 100);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggle = (taskId: string) => {
    setChecks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#eff4ff]/70 py-2 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={ROUTES.stage2ProjectWorkspace(detail.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#002546] transition-colors hover:text-[#153a75]"
            >
              <MaterialSymbol name="arrow_back" className="text-[18px]" />
              Back to Workspace Overview
            </Link>
            <span className="text-[11px] text-[#737780]">/</span>
            <span className="text-xs font-medium text-[#42474f]">
              Stage 2 · Industry Experience (Board B)
            </span>
            <span className="rounded-full bg-[#0d3b66]/15 px-2 py-0.5 text-[11px] font-semibold text-[#0d3b66]">
              {detail.company} · {detail.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-1 text-[11px] text-[#42474f]">
              <MaterialSymbol name="schedule" className="text-[16px] text-[#153a75]" />
              Iteration 1: <strong className="text-[#0b1c30]">In progress</strong>
            </div>
            <div className="hidden h-3 w-px bg-[#c3c6d0] sm:block" />
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#0b1c30]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#b8d4ff]" />
              Team: {team.name || "Untitled team"}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#0d3b66] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#81a6d7]">
                  Sprint 1
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-[#002546]">
                  Iteration 1 (Weeks 1–2)
                </h1>
              </div>
              <p className="text-base text-[#42474f]">
                Discover and build first solution using the five-step READY framework.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-[#eff4ff] px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#737780]">
                    Iteration Completion
                  </span>
                  <span className="text-lg font-semibold text-[#002546]">
                    {doneCount} / {totalTasks} Evidence Tasks
                  </span>
                </div>
                <div className="relative flex h-12 w-12 items-center justify-center">
                  <svg className="h-10 w-10 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-[#dce9ff]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#153a75]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${pct}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-[#0b1c30]">{pct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl bg-[#eff4ff]/60 p-3 shadow-sm">
            <div className="relative grid grid-cols-5 gap-1 sm:gap-3">
              {READY_STEPPER.map((step) => {
                const active =
                  step.status === "active" || step.status === "progress";
                return (
                  <div
                    key={step.key}
                    className={
                      active
                        ? "flex cursor-default flex-col items-center text-center"
                        : "flex cursor-default flex-col items-center text-center opacity-70"
                    }
                  >
                    <div
                      className={
                        active
                          ? "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-md sm:h-11 sm:w-11"
                          : "flex h-10 w-10 items-center justify-center rounded-full bg-[#dce9ff] text-lg font-bold text-[#42474f] sm:h-11 sm:w-11"
                      }
                      style={active ? { backgroundColor: step.color } : undefined}
                    >
                      {step.key}
                    </div>
                    <span
                      className={
                        active
                          ? "mt-1 text-xs font-bold text-[#0b1c30]"
                          : "mt-1 text-xs font-medium text-[#42474f]"
                      }
                    >
                      {step.name}
                    </span>
                    <span className="hidden text-[11px] text-[#42474f] md:inline">
                      {step.subtitle}
                    </span>
                    <span
                      className="mt-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
                      style={
                        active
                          ? {
                              backgroundColor:
                                step.status === "progress" ? "#fef3c7" : "#ffedd5",
                              color:
                                step.status === "progress" ? "#92400e" : "#9a3412",
                            }
                          : { backgroundColor: "#e5eeff", color: "#737780" }
                      }
                    >
                      {statusLabel(step.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {READY_PHASES.map((phase) => (
            <ReadyPillar
              key={phase.key}
              phase={phase}
              tab={pillarTabs[phase.key]}
              onTab={(next) =>
                setPillarTabs((prev) => ({ ...prev, [phase.key]: next }))
              }
              checks={checks}
              onToggle={toggle}
              onCta={() => showToast(`${phase.cta} — coming soon`)}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#d3e4fe] text-[#153a75]">
              <MaterialSymbol name="rocket_launch" className="text-[28px]" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#002546]">Ready to prototype?</h4>
              <p className="text-xs text-[#42474f]">
                Once you synthesize your top observations, jump into{" "}
                <strong className="text-[#0b1c30]">Do & Test (Build a simple solution)</strong>.
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => showToast("Evidence export coming soon")}
              className="w-full rounded-lg bg-[#dce9ff] px-5 py-2 text-xs font-semibold text-[#0b1c30] transition-colors hover:bg-[#e5eeff] md:w-auto"
            >
              Export Evidence Deck
            </button>
            <Link
              href={ROUTES.stage2ProjectDoProof(detail.id)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#002546] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d3b66] md:w-auto"
            >
              Proceed to Do (Step D)
              <MaterialSymbol name="east" className="text-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#002546] px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function ReadyPillar({
  phase,
  tab,
  onTab,
  checks,
  onToggle,
  onCta,
}: {
  phase: ReadyPhase;
  tab: PillarTab;
  onTab: (tab: PillarTab) => void;
  checks: Record<string, boolean>;
  onToggle: (taskId: string) => void;
  onCta: () => void;
}) {
  const logged = phase.evidence.length;
  const loggedLabel =
    phase.key === "A"
      ? `${logged} Formulated`
      : `${logged} Logged`;

  return (
    <section className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 lg:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: phase.accent }}
            >
              {phase.key}
            </div>
            <div>
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: phase.accentText }}
              >
                {phase.stepLabel}
              </span>
              <h2 className="text-xl font-semibold text-[#002546]">
                {phase.name} – {phase.subtitle}
              </h2>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: phase.accentSoft, color: phase.accentText }}
          >
            {loggedLabel}
          </span>
        </div>
        <p className="text-sm text-[#42474f]">{phase.description}</p>
      </div>

      <div className="flex gap-1 bg-[#eff4ff] px-4">
        {(
          [
            ["task", "Your task"],
            ["examples", "Examples"],
            ["guide", "Guide"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            className={
              tab === id
                ? "rounded-t-lg bg-white px-3 py-2 text-xs font-semibold text-[#002546] shadow-sm"
                : "px-3 py-2 text-xs font-medium text-[#42474f] transition-colors hover:text-[#0b1c30]"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 bg-white p-4 lg:p-5">
        {tab === "task" ? (
          <>
            <div className="space-y-2">
              {phase.tasks.map((task) => {
                const checked = Boolean(checks[task.id]);
                return (
                  <label
                    key={task.id}
                    className={
                      checked
                        ? "flex cursor-pointer items-start gap-2 rounded-lg bg-[#eff4ff]/70 p-2 transition-colors hover:bg-[#eff4ff]"
                        : "flex cursor-pointer items-start gap-2 rounded-lg bg-[#eff4ff]/40 p-2 transition-colors hover:bg-[#eff4ff]"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(task.id)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-[#153a75]"
                    />
                    <span
                      className={
                        checked
                          ? "select-none text-sm text-[#0b1c30]"
                          : "select-none text-sm text-[#42474f]"
                      }
                    >
                      {task.label}
                      {task.hint ? (
                        <span className="text-xs text-[#42474f]"> {task.hint}</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onCta}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102b55] active:scale-[0.99]"
            >
              {phase.cta}
              <MaterialSymbol
                name={phase.key === "R" ? "arrow_forward" : "add"}
                className="text-[18px]"
              />
            </button>
          </>
        ) : tab === "examples" ? (
          <p className="text-sm text-[#42474f]">
            Review sample {phase.name.toLowerCase()} evidence below. Use these as quality
            targets for your own logs.
          </p>
        ) : (
          <p className="text-sm text-[#42474f]">
            Complete each checklist item, then capture proof with {phase.cta.toLowerCase()}.
            Evidence strengthens your Stage 2 portfolio.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 lg:px-5 lg:pb-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#002546]">
            {phase.evidenceTitle} ({phase.evidence.length})
          </h3>
          <span className="text-[11px] font-semibold text-[#153a75]">
            {phase.evidenceBadge}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {phase.evidence.map((item) => (
            <EvidenceCard key={item.id} phaseKey={phase.key} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EvidenceCard({
  phaseKey,
  item,
}: {
  phaseKey: ReadyPhaseKey;
  item: ReadyPhase["evidence"][number];
}) {
  if (phaseKey === "A") {
    return (
      <div className="flex items-start justify-between gap-2 rounded-xl bg-[#eff4ff] p-3 shadow-sm transition-all hover:bg-[#e5eeff]">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-[#d97706]">
            <MaterialSymbol name="lightbulb" className="text-[20px]" filled />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-[#0b1c30]">{item.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.badge ? (
                <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-semibold text-[#42474f]">
                  {item.badge}
                </span>
              ) : null}
              <span className="text-xs text-[#737780]">{item.meta}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-[#eff4ff] p-3 shadow-sm transition-all hover:bg-[#e5eeff]">
      <div className="flex min-w-0 items-center gap-3">
        {item.imageSrc ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
            <Image src={item.imageSrc} alt="" fill className="object-cover" sizes="56px" />
          </div>
        ) : item.avatarSrc ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-sm">
            <Image src={item.avatarSrc} alt="" fill className="object-cover" sizes="48px" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#0b1c30] sm:whitespace-normal sm:text-sm">
            {item.title}
          </p>
          <span className="text-xs text-[#42474f]">{item.meta}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  DO_PHASE_TASKS,
  DO_TEST_SAMPLE,
  PROOF_PHASE_TASKS,
  PROOF_TEMPLATE_IMAGE,
  type DoProofTask,
} from "@/constants/stage2-ready-framework";
import { ROUTES } from "@/constants/routes";
import { projectsApi, type ProjectTeam } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

type BoardTab = "task" | "examples" | "guide";

function storageKey(projectId: string) {
  return `imready:stage2:do-proof:${projectId}`;
}

function defaultChecks() {
  const map: Record<string, boolean> = {};
  for (const task of [...DO_PHASE_TASKS, ...PROOF_PHASE_TASKS]) {
    map[task.id] = Boolean(task.defaultChecked);
  }
  return map;
}

export function Stage2DoProofView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>(defaultChecks);
  const [doTab, setDoTab] = useState<BoardTab>("task");
  const [proofTab, setProofTab] = useState<BoardTab>("task");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(detail.id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setChecks((prev) => ({ ...prev, ...parsed }));
    } catch {
      /* ignore */
    }
  }, [detail.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(detail.id), JSON.stringify(checks));
    } catch {
      /* ignore */
    }
    const timer = window.setTimeout(() => {
      void projectsApi
        .updateStageProgress(detail.id, {
          currentStage: "DO",
          checkpoints: { doProof: checks },
        })
        .catch(() => {
          /* preview / offline ok */
        });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [checks, detail.id]);

  const doDone = useMemo(
    () => DO_PHASE_TASKS.filter((t) => checks[t.id]).length,
    [checks],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggle = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full">
      <div className="w-full bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 md:flex-row lg:px-8">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <Link
              href={ROUTES.stage2ProjectReady(detail.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] transition-colors hover:text-[#002546]"
            >
              <MaterialSymbol name="arrow_back" className="text-[18px]" />
              READY
            </Link>
            <span className="text-[11px] text-[#c3c6d0]">/</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[#002546]">Iteration 1</span>
              <span className="rounded-full bg-[#dce9ff] px-2 py-0.5 text-[11px] font-semibold text-[#204874]">
                Weeks 1–2
              </span>
            </div>
          </div>

          <ReadyRibbon />

          <div className="hidden items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-1 xl:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#153a75]" />
            <span className="text-[11px] font-semibold text-[#0b1c30]">
              Milestone Target: In Progress · {team.name || "Team"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-xl bg-[#eff4ff] p-3 shadow-sm md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#002546] shadow-sm">
              <MaterialSymbol name="science" className="text-[24px]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#002546]">
                  Project Work with Two Iterations
                </span>
                <span className="rounded bg-[#e5eeff] px-1.5 py-0.5 text-[11px] font-semibold text-[#42474f]">
                  {detail.company} · {detail.title}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#42474f]">
                Complete simple prototyping & user tests in Step D, then finalize reflection
                artifacts in Step Y.
              </p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#42474f]">
            <MaterialSymbol name="timer" className="text-[16px] text-[#153a75]" />
            Review unlockable after Iteration 1
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <DoBoard
            tab={doTab}
            onTab={setDoTab}
            checks={checks}
            done={doDone}
            total={DO_PHASE_TASKS.length}
            onToggle={toggle}
            onUpload={() => showToast("Prototype upload coming soon")}
          />
          <ProofBoard
            tab={proofTab}
            onTab={setProofTab}
            checks={checks}
            onToggle={toggle}
            onUpload={() => showToast("Iteration 1 proof upload coming soon")}
            onFeedback={() => showToast("Owner feedback request coming soon")}
            onDownload={() => showToast("Proof template download coming soon")}
          />
        </div>

        <div className="relative mt-8 overflow-hidden rounded-xl bg-[#002546] p-5 text-white shadow-md lg:p-6">
          <div className="relative z-10 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
                <MaterialSymbol
                  name="workspace_premium"
                  className="text-[30px] text-[#b8d4ff]"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#b8d4ff]">
                  Stage 2 Milestone · Industry Ready
                </span>
                <h3 className="mt-0.5 text-2xl font-bold leading-tight tracking-tight lg:text-[32px]">
                  “You don’t just learn. You do. And that changes you.”
                </h3>
                <p className="mt-1 text-sm text-[#81a6d7]">
                  Real Problems. Real People. A More Ready You.
                </p>
              </div>
            </div>
            <Link
              href={ROUTES.stage2ProjectSubmit(detail.id)}
              className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-[#d3e4ff] px-5 py-3 text-sm font-semibold text-[#001c38] transition-colors hover:bg-[#b8d4ff] md:w-auto"
            >
              Continue to Wrap-up & Demo
              <MaterialSymbol name="arrow_forward" className="text-[18px]" />
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

function ReadyRibbon() {
  const steps: Array<{
    key: string;
    label: string;
    state: "done" | "active" | "next";
  }> = [
    { key: "R", label: "R · Reality", state: "done" },
    { key: "E", label: "E · Engage", state: "done" },
    { key: "A", label: "A · Analyze", state: "done" },
    { key: "D", label: "Do & Test", state: "active" },
    { key: "Y", label: "Your Proof", state: "next" },
  ];

  return (
    <div className="flex max-w-full items-center gap-2 overflow-x-auto py-1 sm:gap-3">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-2 sm:gap-3">
          {index > 0 ? (
            <div
              className={
                step.state === "done" || steps[index - 1]?.state === "done"
                  ? "h-0.5 w-4 shrink-0 bg-[#153a75] sm:w-6"
                  : "h-0.5 w-4 shrink-0 bg-[#c3c6d0] sm:w-6"
              }
            />
          ) : null}
          <div className="flex items-center gap-1.5">
            {step.state === "done" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#153a75] text-white shadow-sm">
                <MaterialSymbol name="check" className="text-[18px]" />
              </div>
            ) : step.state === "active" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d3b66] text-sm font-bold text-white shadow-sm ring-4 ring-[#d3e4fe]">
                {step.key}
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002e97] text-sm font-bold text-white shadow-sm">
                {step.key}
              </div>
            )}
            <span
              className={
                step.state === "active"
                  ? "text-sm font-bold text-[#002546]"
                  : step.state === "done"
                    ? "hidden text-xs font-semibold text-[#153a75] sm:inline"
                    : "hidden text-xs font-semibold text-[#002e97] sm:inline"
              }
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BoardTabs({
  value,
  onChange,
}: {
  value: BoardTab;
  onChange: (tab: BoardTab) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-[#eff4ff] p-1">
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
          onClick={() => onChange(id)}
          className={
            value === id
              ? "flex-1 rounded-md bg-white py-1.5 text-center text-xs font-semibold text-[#002546] shadow-sm"
              : "flex-1 rounded-md py-1.5 text-center text-xs font-medium text-[#42474f] transition-colors hover:text-[#0b1c30]"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Checklist({
  tasks,
  checks,
  onToggle,
  accentChecked,
}: {
  tasks: readonly DoProofTask[];
  checks: Record<string, boolean>;
  onToggle: (id: string) => void;
  accentChecked: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[#f8f9ff] p-3">
      {tasks.map((task) => {
        const checked = Boolean(checks[task.id]);
        return (
          <label
            key={task.id}
            className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-[#eff4ff]"
          >
            <button
              type="button"
              aria-pressed={checked}
              onClick={(e) => {
                e.preventDefault();
                onToggle(task.id);
              }}
              className={
                checked
                  ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                  : "mt-0.5 h-5 w-5 shrink-0 rounded bg-[#dce9ff] transition-colors group-hover:bg-[#d3e4fe]"
              }
              style={checked ? { backgroundColor: accentChecked } : undefined}
            >
              {checked ? (
                <MaterialSymbol name="check" className="text-[16px]" />
              ) : null}
            </button>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-[#0b1c30]">{task.label}</span>
              <span className="text-xs text-[#42474f]">{task.hint}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function DoBoard({
  tab,
  onTab,
  checks,
  done,
  total,
  onToggle,
  onUpload,
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  checks: Record<string, boolean>;
  done: number;
  total: number;
  onToggle: (id: string) => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-xl font-bold text-[#153a75] shadow-sm">
            D
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
              Iteration 1 · Step 4
            </span>
            <h1 className="text-2xl font-bold text-[#0b1c30]">Do – Build, test and learn</h1>
            <p className="mt-1 text-sm text-[#42474f]">Create a simple solution and test it.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#d3e4fe] px-2 py-1 text-[11px] font-semibold text-[#153a75]">
          Screen 16
        </span>
      </div>

      <BoardTabs value={tab} onChange={onTab} />

      {tab === "task" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold text-[#0b1c30]">Execution Checklist</span>
            <span className="text-[11px] font-semibold text-[#153a75]">
              {done} of {total} Done
            </span>
          </div>
          <Checklist
            tasks={DO_PHASE_TASKS}
            checks={checks}
            onToggle={onToggle}
            accentChecked="#002546"
          />
        </div>
      ) : tab === "examples" ? (
        <p className="rounded-xl bg-[#f8f9ff] p-3 text-sm text-[#42474f]">
          Keep prototypes small. A clickable flow or annotated wireframe is enough for Iteration 1
          testing.
        </p>
      ) : (
        <p className="rounded-xl bg-[#f8f9ff] p-3 text-sm text-[#42474f]">
          Build → test with real users → capture what happened. Then move into Your Proof to
          reflect.
        </p>
      )}

      <button
        type="button"
        onClick={onUpload}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55] active:scale-[0.99]"
      >
        <MaterialSymbol name="cloud_upload" className="text-[20px]" />
        Upload Prototype/Test →
      </button>

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[#0b1c30]">Your Tests (1)</span>
          <button
            type="button"
            onClick={onUpload}
            className="text-[11px] font-semibold text-[#002546] hover:underline"
          >
            View archive
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#dce9ff]">
            <Image
              src={DO_TEST_SAMPLE.imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
            />
            <div className="absolute inset-0 bg-[#002546]/10" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#153a75]">
              <MaterialSymbol name="check_circle" className="text-[14px]" />
              {DO_TEST_SAMPLE.badge}
            </div>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-[#0b1c30]">
              {DO_TEST_SAMPLE.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#42474f]">
              <span className="inline-flex items-center gap-1">
                <MaterialSymbol name="schedule" className="text-[14px] text-[#737780]" />
                {DO_TEST_SAMPLE.meta}
              </span>
              <span className="text-[#737780]">•</span>
              <span className="font-medium text-[#153a75]">{DO_TEST_SAMPLE.participants}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-start gap-3 rounded-xl bg-[#dce9ff] p-3 text-[#204874] shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#002546] shadow-sm">
          <MaterialSymbol name="rocket_launch" className="text-[20px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#002546]">Iteration 1 Complete?</h4>
          <p className="mt-0.5 text-xs text-[#0b1c30]">
            Move to Your Proof to summarize what you did and what you learned before moving
            forward.
          </p>
        </div>
        <MaterialSymbol name="arrow_forward" className="mt-1 shrink-0 text-[20px] text-[#002546]" />
      </div>
    </div>
  );
}

function ProofBoard({
  tab,
  onTab,
  checks,
  onToggle,
  onUpload,
  onFeedback,
  onDownload,
}: {
  tab: BoardTab;
  onTab: (tab: BoardTab) => void;
  checks: Record<string, boolean>;
  onToggle: (id: string) => void;
  onUpload: () => void;
  onFeedback: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002e97] text-xl font-bold text-white shadow-sm">
            Y
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#002e97]">
              Iteration 1 · Step 5
            </span>
            <h2 className="text-2xl font-bold text-[#0b1c30]">
              Your Proof – Summarize & reflect
            </h2>
            <p className="mt-1 text-sm text-[#42474f]">
              Capture your first solution and what you learned.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#dce9ff] px-2 py-1 text-[11px] font-semibold text-[#002546]">
          Screen 17
        </span>
      </div>

      <BoardTabs value={tab} onChange={onTab} />

      {tab === "task" ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-semibold text-[#0b1c30]">Submission Requirements</span>
            <span className="text-[11px] font-semibold text-[#002e97]">Ready for upload</span>
          </div>
          <Checklist
            tasks={PROOF_PHASE_TASKS}
            checks={checks}
            onToggle={onToggle}
            accentChecked="#002e97"
          />
        </div>
      ) : tab === "examples" ? (
        <p className="rounded-xl bg-[#f8f9ff] p-3 text-sm text-[#42474f]">
          A short slide deck or 2-minute screen recording that shows your solution and key
          learnings works well.
        </p>
      ) : (
        <p className="rounded-xl bg-[#f8f9ff] p-3 text-sm text-[#42474f]">
          Reflect honestly: what changed for users, what still breaks, and what you will improve
          next.
        </p>
      )}

      <button
        type="button"
        onClick={onUpload}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55] active:scale-[0.99]"
      >
        <MaterialSymbol name="assignment_turned_in" className="text-[20px]" />
        Upload Iteration 1 Proof →
      </button>

      <button
        type="button"
        onClick={onFeedback}
        className="group flex w-full items-start justify-between gap-3 rounded-xl bg-[#eff4ff] p-3 text-left shadow-sm transition-colors hover:bg-[#e5eeff]"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#002546] shadow-sm transition-colors group-hover:bg-[#002546] group-hover:text-white">
            <MaterialSymbol name="record_voice_over" className="text-[22px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-[#0b1c30]">
                Request Feedback from Owner
              </span>
              <span className="rounded-full bg-[#dce9ff] px-1.5 py-0.5 text-[11px] font-semibold text-[#42474f]">
                Optional
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#42474f]">
              You can ask the project owner to review Iteration 1. You may or may not receive
              feedback, but you must continue to Iteration 2.
            </p>
          </div>
        </div>
        <MaterialSymbol
          name="chevron_right"
          className="mt-2 shrink-0 text-[22px] text-[#737780] transition-colors group-hover:text-[#002546]"
        />
      </button>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#dce9ff]">
            <Image
              src={PROOF_TEMPLATE_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#0b1c30]">Proof Template Checklist</span>
            <p className="text-xs text-[#42474f]">
              Slides or single 2-min screen recording supported
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="rounded-lg bg-[#e5eeff] px-3 py-1.5 text-[11px] font-semibold text-[#0b1c30] transition-colors hover:bg-[#dce9ff]"
        >
          Download Format
        </button>
      </div>
    </div>
  );
}

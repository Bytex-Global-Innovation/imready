"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  ITERATION_1_CYCLE,
  ITERATION_2_CYCLE,
} from "@/constants/stage2-ready-framework";
import { ROUTES } from "@/constants/routes";
import type { ProjectTeam } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type WorkspaceTab = "overview" | "work" | "evidence" | "team";

export function Stage2ProjectWorkspaceView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const { student } = useStudentProfile();
  const [tab, setTab] = useState<WorkspaceTab>("overview");

  const accepted = useMemo(
    () => team.members.filter((m) => m.status === "ACCEPTED"),
    [team.members],
  );
  const teamMax = Math.max(1, team.teamSizeMax || detail.teamSizeMax || 1);
  const isLead =
    student?.id != null && String(team.leadStudentId) === String(student.id);

  const displayName = student?.studentName?.trim() || "You";
  const heroSrc =
    resolveMediaUrl(detail.heroImage) || "/images/projects/placeholder.jpg";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <section className="mb-6 rounded-xl bg-[#eff4ff] px-4 py-3 shadow-sm lg:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#0b1c30]">
            <span className="rounded-full bg-[#0d3b66] px-2 py-0.5 text-[11px] font-semibold text-[#81a6d7]">
              Board B
            </span>
            <span className="text-xs text-[#42474f]">Stage 2</span>
            <MaterialSymbol name="chevron_right" className="text-[16px] text-[#737780]" />
            <span className="text-xs font-semibold text-[#002546]">
              Project Work with Two Iterations
            </span>
            <span className="hidden text-[11px] text-[#737780] sm:inline">•</span>
            <span className="hidden text-xs text-[#42474f] sm:inline">
              Work independently using the READY framework (2 weeks per iteration)
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs italic text-[#002546] shadow-sm">
            <MaterialSymbol name="format_quote" className="text-[18px] text-[#153a75]" />
            “You don’t just learn. You do. And that changes you.”
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 items-end gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="flex items-center justify-between lg:col-span-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002546] text-[11px] font-semibold text-white">
              11
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#002546]">
                Project Workspace
              </h1>
              <p className="text-xs text-[#42474f]">Your hub for real work</p>
            </div>
          </div>
          <span className="rounded bg-[#dce9ff] px-2 py-0.5 text-[11px] font-semibold text-[#002546]">
            Live Sprint
          </span>
        </div>
        <div className="flex items-center justify-between lg:col-span-7">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002546] text-[11px] font-semibold text-white">
              12
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#002546]">
                READY Journey Overview
              </h2>
              <p className="text-xs text-[#42474f]">Two iterations to a better solution</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#153a75]">
            <MaterialSymbol name="cycle" className="text-[16px]" />
            2 Full Iteration Cycles
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex flex-col gap-4 bg-[#eff4ff] p-4 lg:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
                    <Image
                      src={heroSrc}
                      alt={detail.heroImageAlt || detail.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold leading-snug text-[#002546]">
                      {detail.title}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-[#42474f]">
                      <MaterialSymbol name="corporate_fare" className="text-[16px]" />
                      <span className="text-xs font-medium">{detail.company}</span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#d3e4fe] px-3 py-1 text-[11px] font-semibold text-[#153a75]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#153a75]" />
                  In Progress
                </span>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-[#e5eeff] p-1">
                {(
                  [
                    ["overview", "Overview"],
                    ["work", "Work"],
                    ["evidence", "Evidence"],
                    ["team", "Team"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={
                      tab === id
                        ? "flex-1 rounded-md bg-white py-1.5 text-center text-xs font-semibold text-[#002546] shadow-sm"
                        : "flex-1 rounded-md py-1.5 text-center text-xs font-medium text-[#42474f] transition-colors hover:text-[#0b1c30]"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5 p-4 lg:p-5">
              {tab === "overview" || tab === "work" ? (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#002546]">
                        Project Timeline
                      </span>
                      <span className="text-xs font-medium text-[#42474f]">
                        4 weeks total • 2 iterations
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <TimelineCard
                        n="1"
                        title="Iteration 1"
                        meta="Weeks 1–2"
                        active
                        icon="radio_button_checked"
                      />
                      <TimelineCard
                        n="2"
                        title="Iteration 2"
                        meta="Weeks 3–4"
                        icon="schedule"
                      />
                      <TimelineCard
                        n="flag"
                        title="Final Review"
                        meta="After Week 4"
                        icon="lock"
                        flag
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-[#e5eeff] p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-[#153a75]">
                      <MaterialSymbol name="lightbulb" className="text-[22px]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#002546]">
                        You are in Iteration 1
                      </p>
                      <p className="mt-0.5 text-sm text-[#42474f]">
                        Discover and build your first solution using the READY cycle.
                      </p>
                    </div>
                  </div>
                </>
              ) : null}

              {tab === "evidence" ? (
                <div className="rounded-xl bg-[#eff4ff] p-4 text-sm text-[#42474f]">
                  Evidence lives in the READY Framework. Log observations, conversations, and
                  insights as you move through R → E → A → D → Y.
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#002546]">
                      Team ({accepted.length}/{teamMax})
                    </span>
                    <span className="text-xs text-[#42474f]">Active Members</span>
                  </div>
                  <Link
                    href={ROUTES.stage2ProjectTeam(detail.id)}
                    className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#153a75] hover:underline"
                  >
                    Manage
                    <MaterialSymbol name="arrow_forward" className="text-[16px]" />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 py-1">
                  {accepted.map((member) => {
                    const lead =
                      String(member.studentId) === String(team.leadStudentId);
                    return (
                      <div
                        key={member.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3 py-1"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#002546] text-[10px] font-bold text-white">
                          {initials(member.studentName)}
                        </div>
                        <span className="text-[11px] font-semibold text-[#002546]">
                          {member.studentName.split(" ")[0]}
                          {lead ? " (Lead)" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {tab === "team" ? (
                  <p className="text-xs text-[#42474f]">
                    Signed in as {displayName}
                    {isLead ? " · Team Lead" : ""}. Team is locked after creation.
                  </p>
                ) : null}
              </div>

              <Link
                href={ROUTES.stage2ProjectReady(detail.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55]"
              >
                Continue to Iteration 1
                <MaterialSymbol name="arrow_forward" className="text-[20px]" />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#eff4ff] p-4">
            <div className="flex items-center gap-3">
              <MaterialSymbol name="calendar_clock" className="text-[24px] text-[#3a608d]" />
              <div>
                <p className="text-xs font-semibold text-[#002546]">
                  Sprint Checkpoint: Day 1 of 14
                </p>
                <p className="text-xs text-[#42474f]">
                  Recommended target: Complete Stage R (Reality)
                </p>
              </div>
            </div>
            <span className="rounded bg-[#e5eeff] px-2 py-0.5 text-[11px] font-semibold text-[#0b1c30]">
              On Track
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex flex-col gap-6 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-[#002546]">
                Your journey for this project
              </h3>
              <p className="mt-1 text-base text-[#42474f]">
                Use the READY cycle twice. Learn, improve and build a stronger solution.
              </p>
            </div>

            <IterationBlock
              label="Iteration 1"
              weeks="Weeks 1–2"
              blurb="Discover and build first solution"
              solid
              steps={ITERATION_1_CYCLE}
            />

            <div className="relative z-10 -my-2 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[#002546] shadow-md">
                <MaterialSymbol
                  name="arrow_downward"
                  className="animate-bounce text-[20px] text-[#153a75]"
                />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#42474f]">
                  Synthesize learnings & feed into iteration 2
                </span>
                <MaterialSymbol
                  name="arrow_downward"
                  className="animate-bounce text-[20px] text-[#153a75]"
                />
              </div>
            </div>

            <IterationBlock
              label="Iteration 2"
              weeks="Weeks 3–4"
              blurb="Improve and refine solution"
              solid={false}
              steps={ITERATION_2_CYCLE}
            />

            <div className="flex items-start gap-3 rounded-xl bg-[#eff4ff] p-3">
              <MaterialSymbol
                name="tips_and_updates"
                className="mt-0.5 shrink-0 text-[24px] text-[#153a75]"
              />
              <p className="text-sm leading-relaxed text-[#0b1c30]">
                <strong className="font-semibold text-[#002546]">Strategic Directive:</strong>{" "}
                Use real evidence and testing to decide what to improve. Don&apos;t wait for
                owner feedback during the work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  n,
  title,
  meta,
  icon,
  active,
  flag,
}: {
  n: string;
  title: string;
  meta: string;
  icon: string;
  active?: boolean;
  flag?: boolean;
}) {
  return (
    <div
      className={
        active
          ? "flex flex-col gap-1 rounded-lg bg-[#dce9ff] p-3"
          : "flex flex-col gap-1 rounded-lg bg-[#eff4ff] p-3 opacity-80"
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            active
              ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#153a75] text-[11px] font-bold text-white"
              : "flex h-6 w-6 items-center justify-center rounded-full bg-[#d3e4fe] text-[11px] font-semibold text-[#0b1c30]"
          }
        >
          {flag ? <MaterialSymbol name="flag" className="text-[14px]" /> : n}
        </span>
        <MaterialSymbol
          name={icon}
          className={active ? "text-[18px] text-[#153a75]" : "text-[18px] text-[#737780]"}
        />
      </div>
      <span
        className={
          active
            ? "mt-1 text-xs font-semibold text-[#002546]"
            : "mt-1 text-xs font-semibold text-[#0b1c30]"
        }
      >
        {title}
      </span>
      <span className="text-xs text-[#42474f]">{meta}</span>
    </div>
  );
}

function IterationBlock({
  label,
  weeks,
  blurb,
  solid,
  steps,
}: {
  label: string;
  weeks: string;
  blurb: string;
  solid: boolean;
  steps: ReadonlyArray<{ key: string; name: string; blurb: string; color: string }>;
}) {
  return (
    <div
      className={
        solid
          ? "flex flex-col gap-3 rounded-xl bg-[#eff4ff] p-4 lg:p-5"
          : "flex flex-col gap-3 rounded-xl bg-[#dce9ff] p-4 lg:p-5"
      }
    >
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span
            className={
              solid
                ? "rounded bg-[#002546] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
                : "rounded bg-[#3a608d] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
            }
          >
            {label}
          </span>
          <span className="text-sm font-semibold text-[#002546]">{weeks}</span>
        </div>
        <span className="text-sm font-medium text-[#42474f]">{blurb}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-5">
        {steps.map((step) => (
          <div
            key={`${label}-${step.key}`}
            className="flex flex-col items-center gap-1 rounded-lg bg-white p-3 text-center shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
              style={{ backgroundColor: step.color }}
            >
              {step.key}
            </div>
            <span className="text-xs font-semibold text-[#002546]">{step.name}</span>
            <span className="text-[11px] text-[#42474f]">{step.blurb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

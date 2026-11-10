"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import {
  STAGE2_APPLY_CONTEXT_IMAGE,
  STAGE2_CONTRIBUTION_ITEMS,
  type Stage2ProjectDetail,
} from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { projectsApi } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function defaultContributions(): Record<string, boolean> {
  return Object.fromEntries(
    STAGE2_CONTRIBUTION_ITEMS.map((item) => [item.id, Boolean(item.defaultSelected)]),
  );
}

export function Stage2ProjectApplyView({ detail }: { detail: Stage2ProjectDetail }) {
  const { student } = useStudentProfile();
  const displayName = student?.studentName?.trim() || "Aarav Sharma";
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);

  const [step, setStep] = useState<"form" | "submitted">("form");
  const [interestConfirmed, setInterestConfirmed] = useState(false);
  const [motivation, setMotivation] = useState(detail.motivationDefault);
  const [contributions, setContributions] = useState(defaultContributions);

  const selectedCount = useMemo(
    () => Object.values(contributions).filter(Boolean).length,
    [contributions],
  );

  const detailHref = ROUTES.stage2ProjectDetail(detail.id);
  const teamHref = ROUTES.stage2ProjectTeam(detail.id);
  const exploreHref = ROUTES.freeProjects;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const selected = Object.entries(contributions)
          .filter(([, checked]) => checked)
          .map(([name]) => name);
        await projectsApi.apply(detail.id, {
          motivation,
          contributions: selected,
        });
        setStep("submitted");
        setInterestConfirmed(true);
        window.scrollTo({ top: 120, behavior: "smooth" });
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Could not submit application. Try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [contributions, detail.id, motivation, submitting],
  );

  const domainLabel = `${detail.categoryPill} Domain`;

  if (detail.applicationsClosed || detail.applicationsNotYetOpen) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">
          {detail.applicationsClosed ? "Applications closed" : "Applications not open yet"}
        </h1>
        <p className="text-sm text-[#42474f]">
          {detail.applicationsClosed
            ? "The application window for this project has ended."
            : detail.applyOpensAt
              ? `Applications open on ${detail.applyOpensAt}.`
              : "Please check back when applications open."}
        </p>
        <Link
          href={detailHref}
          className="text-sm font-semibold text-[#153a75] hover:underline"
        >
          View project details
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
          {/* Top bar */}
          <div className="mb-8 flex flex-wrap items-center justify-end gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-full bg-[#eff4ff] px-4 py-1 shadow-sm">
              <ProgressStep active label="Interest Form" number={1} />
              <MaterialSymbol name="chevron_right" className="text-[16px] text-[#c3c6d0]" />
              <ProgressStep active={interestConfirmed} label="Confirmed" number={2} />
              <MaterialSymbol name="chevron_right" className="text-[16px] text-[#c3c6d0]" />
              <ProgressStep label="Form Team" number={3} dimmed />
            </div>
          </div>

          {/* Project context */}
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <Image
                  src={STAGE2_APPLY_CONTEXT_IMAGE}
                  alt="Two diverse university students collaborating over a laptop in a brightly lit modern tech incubator"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex flex-col">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold tracking-tight text-[#002546]">
                    {detail.title}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#b8d4ff]/40 px-2 py-0.5 text-[11px] font-semibold text-[#001c38]">
                    <MaterialSymbol
                      name="verified"
                      className="text-[13px] text-[#153a75]"
                      filled
                    />
                    Verified Project Owner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#42474f]">
                  <span className="font-semibold text-[#0b1c30]">{detail.company}</span>
                  <span className="text-[#c3c6d0]">•</span>
                  <span className="flex items-center gap-1">
                    <MaterialSymbol name="workspaces" className="text-[15px]" />
                    {domainLabel}
                  </span>
                  <span className="text-[#c3c6d0]">•</span>
                  <span className="flex items-center gap-1">
                    <MaterialSymbol name="schedule" className="text-[15px]" />
                    {detail.duration}
                  </span>
                  <span className="text-[#c3c6d0]">•</span>
                  <span className="flex items-center gap-1">
                    <MaterialSymbol name="group" className="text-[15px]" />
                    {detail.teamSize}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start rounded-lg bg-[#eff4ff] px-3 py-2 md:self-auto">
              <MaterialSymbol name="stars" className="text-[20px] text-[#153a75]" />
              <div className="flex flex-col text-left">
                <span className="text-[11px] uppercase text-[#42474f]">Platform Stage</span>
                <span className="text-xs font-semibold text-[#0b1c30]">
                  Stage 2: Industry Experience
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#002546] text-lg font-semibold text-white">
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-[#0b1c30]">{displayName}</span>
                    <span className="text-xs font-semibold text-[#153a75]">
                      Ready for Stage 2 Projects
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-[#eff4ff] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0b1c30]">
                        Foundation Milestone
                      </span>
                      <span className="text-[11px] font-bold text-[#153a75]">100% Complete</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#dce9ff]">
                      <div className="h-full w-full rounded-full bg-[#153a75]" />
                    </div>
                  </div>
                  <ul className="flex flex-col gap-1 pt-1 text-xs text-[#42474f]">
                    {[
                      "Verified student identity & university accreditation",
                      "Team formation rights granted as Lead Student",
                      "Mentorship checkpoint access enabled",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <MaterialSymbol
                          name="check_circle"
                          className="mt-0.5 text-[18px] text-[#153a75]"
                          filled
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-[#002546] p-6 text-white shadow-md">
                <div className="relative z-10 flex flex-col gap-3">
                  <MaterialSymbol name="format_quote" className="text-[32px] text-[#81a6d7]" />
                  <p className="text-lg font-medium italic leading-relaxed">
                    &ldquo;You don&apos;t just learn. You do. And that changes you.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] uppercase tracking-wider text-[#81a6d7]">
                    <span>Stage 2 Philosophy</span>
                    <span>•</span>
                    <span>Real Proof of Work</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#e5eeff] p-4">
                <MaterialSymbol
                  name="lightbulb"
                  className="mt-0.5 shrink-0 text-[22px] text-[#002546]"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#002546]">Pro Tip for Applicants</span>
                  <p className="mt-1 text-xs text-[#42474f]">
                    Be specific about what you hope to learn. Partner companies prioritize students
                    with curiosity and collaborative drive over past technical seniority.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-8">
              {step === "form" ? (
                <div className="rounded-xl bg-white p-6 shadow-sm lg:p-8">
                  <div className="mb-8 flex items-start justify-between gap-4 border-b border-transparent pb-6">
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#153a75]">
                        <span>Stage 2 Application</span>
                        <span>•</span>
                        <span>Direct Matching</span>
                      </div>
                      <h1 className="text-[32px] font-bold leading-10 tracking-tight text-[#002546]">
                        Show your interest
                      </h1>
                      <p className="mt-1 text-sm text-[#42474f]">
                        Tell the project creators why you&apos;d like to work on this challenge and
                        specify where your skills shine.
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-[#dce9ff] px-3 py-1 text-[11px] font-semibold text-[#002546] sm:inline-flex">
                      Step 1 of 2
                    </span>
                  </div>

                  <form className="flex flex-col gap-8" onSubmit={onSubmit}>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between">
                        <label
                          htmlFor="interest-statement"
                          className="text-lg font-semibold text-[#0b1c30]"
                        >
                          Why are you interested?
                        </label>
                        <span className="text-[11px] text-[#42474f]">Required</span>
                      </div>
                      <textarea
                        id="interest-statement"
                        maxLength={300}
                        rows={4}
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        className="w-full resize-none rounded-lg bg-[#eff4ff] p-4 text-sm text-[#0b1c30] shadow-inner transition-all placeholder:text-[#737780] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002546]"
                      />
                      <div className="flex items-center justify-between px-1 text-[11px] text-[#42474f]">
                        <span>Share personal motivation or alignment with the company challenge</span>
                        <span className="font-semibold text-[#153a75]">
                          {motivation.length}/300
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-semibold text-[#0b1c30]">
                          I can contribute through{" "}
                          <span className="text-sm font-normal text-[#42474f]">
                            (select one or more)
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold text-[#153a75]">
                          {selectedCount} Selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {STAGE2_CONTRIBUTION_ITEMS.map((item) => (
                          <label
                            key={item.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg bg-[#eff4ff] p-3 transition-all hover:bg-[#e5eeff]"
                          >
                            <input
                              type="checkbox"
                              checked={contributions[item.id] ?? false}
                              onChange={(e) =>
                                setContributions((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.checked,
                                }))
                              }
                              className="h-5 w-5 cursor-pointer rounded accent-[#153a75]"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-[#0b1c30]">
                                {item.title}
                              </span>
                              <span className="text-xs text-[#42474f]">{item.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {submitError ? (
                      <p className="text-sm font-medium text-red-600">{submitError}</p>
                    ) : null}
                    <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
                      <div className="flex items-center gap-1 text-xs text-[#42474f]">
                        <MaterialSymbol name="lock" className="text-[18px]" />
                        <span>Applications are shared immediately with the project host</span>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="group inline-flex w-full items-center justify-center gap-1 rounded-full bg-[#153a75] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#102b55] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {submitting ? "Submitting..." : "Continue"}
                        {!submitting ? (
                          <MaterialSymbol
                            name="arrow_forward"
                            className="text-[18px] transition-transform group-hover:translate-x-1"
                          />
                        ) : null}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-6 text-center shadow-lg lg:p-8">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#b8d4ff] shadow-sm">
                    <MaterialSymbol
                      name="check_circle"
                      className="text-[54px] text-[#153a75]"
                      filled
                    />
                  </div>
                  <h2 className="mb-1 text-[32px] font-bold tracking-tight text-[#002546]">
                    Application submitted!
                  </h2>
                  <p className="mx-auto mb-8 max-w-md text-base text-[#42474f]">
                    Your interest has been shared with the project.
                  </p>

                  <div className="mb-8 w-full max-w-lg rounded-xl bg-[#eff4ff] p-6 text-center shadow-inner">
                    <div className="mb-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#153a75]">
                      <MaterialSymbol name="group_add" className="text-[18px]" />
                      Next Milestone
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-[#002546]">
                      Now create your team to get started.
                    </h3>
                    <p className="text-sm text-[#42474f]">
                      Teams can have {detail.teamSize}. You can invite others or form your team.
                    </p>
                  </div>

                  <div className="flex w-full max-w-sm flex-col items-center gap-3">
                    <Link
                      href={teamHref}
                      className="group inline-flex w-full items-center justify-center gap-1 rounded-full bg-[#153a75] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#102b55] hover:shadow-lg"
                    >
                      Create My Team
                      <MaterialSymbol
                        name="arrow_forward"
                        className="text-[18px] transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    <Link
                      href={exploreHref}
                      className="text-sm font-semibold text-[#002546] underline decoration-[#c3c6d0] underline-offset-4 transition-colors hover:text-[#153a75]"
                    >
                      Back to Projects
                    </Link>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-transparent pt-4 text-[11px] text-[#42474f]">
                    <span className="flex items-center gap-1">
                      <MaterialSymbol name="verified_user" className="text-[16px] text-[#153a75]" />
                      Academic Credit Eligible
                    </span>
                    <span className="flex items-center gap-1">
                      <MaterialSymbol name="support_agent" className="text-[16px] text-[#153a75]" />
                      Faculty Mentor Assigned
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
    </div>
  );
}

function ProgressStep({
  number,
  label,
  active,
  dimmed,
}: {
  number: number;
  label: string;
  active?: boolean;
  dimmed?: boolean;
}) {
  const badgeClass = active
    ? "bg-[#153a75] text-white"
    : "bg-[#d3e4fe] text-[#42474f]";
  const labelClass =
    active && !dimmed
      ? "font-bold text-[#0b1c30]"
      : dimmed
        ? "font-medium text-[#42474f]"
        : "font-medium text-[#42474f]";

  return (
    <div className={`flex items-center gap-1 ${dimmed ? "opacity-50" : ""}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${badgeClass}`}
      >
        {number}
      </span>
      <span className={`text-xs ${labelClass}`}>{label}</span>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  DEFAULT_OWNER_FEEDBACK,
  IMPROVE_POINTS,
  STUDENT_QUOTE,
  VALUED_POINTS,
} from "@/constants/stage2-owner-feedback";
import { ROUTES } from "@/constants/routes";
import type {
  ProjectTeam,
  Stage2OwnerFeedback,
  Stage2Outcome,
} from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

export function Stage2OwnerFeedbackView({
  detail,
  team: _team,
  feedback,
  outcome,
  preview,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
  feedback: Stage2OwnerFeedback | null;
  outcome: Stage2Outcome | null;
  preview?: boolean;
}) {
  const published = Boolean(feedback && feedback.status === "SUBMITTED");
  const quote = feedback?.studentQuote || STUDENT_QUOTE;
  const overall = feedback?.overall || DEFAULT_OWNER_FEEDBACK.overall;
  const valued = feedback?.valuedPoints?.length
    ? feedback.valuedPoints
    : [...VALUED_POINTS];
  const improve = feedback?.improvePoints?.length
    ? feedback.improvePoints
    : [...IMPROVE_POINTS];
  const rating = Math.min(5, Math.max(1, Number(feedback?.rating) || 5));
  const outcomeHref = ROUTES.stage2ProjectOutcome(detail.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <section className="mb-6 rounded-xl bg-[#eff4ff] p-5 shadow-sm lg:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex max-w-3xl flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#d3e4fe]/80 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#153a75]">
                Stage 2 · Industry Experience
              </span>
              <span className="text-xs text-[#c3c6d0]">•</span>
              <span className="text-xs font-semibold text-[#42474f]">
                Board C: Review → Outcome → Opportunity
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002546]">
              Industry Feedback Received
            </h1>
            <p className="text-sm text-[#42474f]">
              {published
                ? `${detail.company} reviewed your deliverables and shared structured feedback.`
                : "Waiting for the industry owner (admin) to submit feedback from the Owner Portal."}
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-white px-3 py-2 shadow-sm md:self-auto">
            <span
              className={`h-2.5 w-2.5 rounded-full ${published ? "bg-[#153a75]" : "bg-[#eab308]"}`}
            />
            <span className="text-xs font-semibold text-[#002546]">
              {published ? "Feedback live · Screen 26" : "Awaiting owner feedback"}
            </span>
          </div>
        </div>
      </section>

      <div className="mb-4">
        <Link
          href={ROUTES.stage2ProjectReview(detail.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] hover:text-[#002546]"
        >
          <MaterialSymbol name="arrow_back" className="text-[18px]" />
          Back to Review Pipeline
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col rounded-xl bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#dce9ff]/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#153a75] text-[11px] font-bold text-white shadow-sm">
              26
            </div>
            <div>
              <span className="block text-sm font-bold text-[#002546]">
                Feedback Received
              </span>
              <span className="text-xs text-[#42474f]">See what the owner said</span>
            </div>
          </div>
          <span className="rounded-full bg-[#d3e4fe] px-2 py-1 text-[11px] font-semibold text-[#153a75]">
            Student View
          </span>
        </div>

        {!published && !preview ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#153a75]">
              <MaterialSymbol name="hourglass_top" className="text-[36px]" />
            </div>
            <h2 className="text-xl font-bold text-[#002546]">
              Owner feedback is not published yet
            </h2>
            <p className="max-w-md text-sm text-[#42474f]">
              Admins submit structured feedback from{" "}
              <strong>Stage 2 Reviews</strong> in the admin portal. Once published, this
              page updates automatically.
            </p>
            <Link
              href={ROUTES.stage2ProjectReview(detail.id)}
              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#dce9ff] px-4 py-2.5 text-sm font-semibold text-[#002546]"
            >
              Back to review
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col items-center gap-2 text-center">
              <div className="relative mt-2 mb-1 flex items-center justify-center">
                <div className="pointer-events-none absolute h-24 w-24 rounded-full bg-[#d3e4fe]/50 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#153a75] text-white shadow-lg">
                  <MaterialSymbol
                    name="assignment_turned_in"
                    className="text-[36px]"
                    filled
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#002546]">
                Industry Feedback Received!
              </h2>
              <p className="max-w-md text-xs text-[#42474f]">
                {detail.company} reviewed your final deliverables and Iteration 2 sprint
                submission.
              </p>
            </div>

            <div className="relative mb-5 rounded-xl bg-[#eff4ff] p-5 shadow-sm">
              <MaterialSymbol
                name="format_quote"
                className="pointer-events-none absolute right-4 top-3 select-none text-[40px] text-[#c3c6d0]/40"
              />
              <p className="mb-4 pr-4 text-base font-medium italic leading-relaxed text-[#0b1c30]">
                “{quote}”
              </p>
              <div className="flex items-center gap-3 border-t border-[#dce9ff]/80 pt-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3b66] text-xs font-bold text-white">
                  RM
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold text-[#002546]">
                    Industry Owner
                  </span>
                  <span className="block truncate text-xs text-[#42474f]">
                    {detail.company}
                  </span>
                </div>
                <div className="hidden items-center gap-0.5 text-[#eab308] sm:flex">
                  {Array.from({ length: rating }).map((_, i) => (
                    <MaterialSymbol key={i} name="star" className="text-[16px]" filled />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#eff4ff]">
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d3e4fe] text-[#153a75]">
                    <MaterialSymbol name="thumb_up" className="text-[16px]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#002546]">What the owner valued</h3>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {valued.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-1.5 rounded-lg bg-[#eff4ff] p-2"
                    >
                      <MaterialSymbol
                        name="check_circle"
                        className="mt-0.5 shrink-0 text-[20px] text-[#153a75]"
                        filled
                      />
                      <span className="text-sm font-medium leading-tight text-[#0b1c30]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#eff4ff]">
                <div className="mb-2 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dce9ff] text-[#204874]">
                    <MaterialSymbol name="lightbulb" className="text-[16px]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#002546]">What could improve</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {improve.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 rounded-lg bg-[#eff4ff] px-3 py-2"
                    >
                      <MaterialSymbol
                        name="lightbulb"
                        className="shrink-0 text-[20px] text-[#0d3b66]"
                      />
                      <span className="text-sm font-medium text-[#0b1c30]">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#eff4ff]">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dce9ff] text-[#002546]">
                    <MaterialSymbol name="chat_bubble" className="text-[16px]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#002546]">Overall feedback</h3>
                </div>
                <div className="rounded-lg bg-[#eff4ff] p-3">
                  <p className="text-sm leading-relaxed text-[#0b1c30]">“{overall}”</p>
                </div>
              </div>

              {outcome?.available ? (
                <div className="rounded-xl bg-[#eff4ff] p-3 text-sm text-[#153a75]">
                  <strong>Outcome ready:</strong>{" "}
                  {outcome.paidContinuation
                    ? "Paid continuation / Stage 3 eligibility unlocked."
                    : "Stage 2 complete — no paid continuation at this time."}
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-5">
              <Link
                href={outcomeHref}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102b55]"
              >
                <span>View Full Feedback / Outcome</span>
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

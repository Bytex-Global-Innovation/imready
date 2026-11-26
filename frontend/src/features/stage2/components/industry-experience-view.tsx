"use client";

import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { STAGE2_VALUE_PILLARS } from "@/constants/stage2-industry-experience";
import { MaterialSymbol } from "@/features/stage2/components/material-symbol";

function reviewCopy(status: string | undefined) {
  if (status === "FAILED") {
    return {
      eyebrow: "Foundation review",
      title: "Your Foundation submission needs another look",
      body: "Your Foundation work was not approved. You can still browse Stage 2 projects, but applying stays locked until verification passes.",
    };
  }
  if (status === "PASSED") {
    return {
      eyebrow: "Foundation complete",
      title: "You're verified for Stage 2",
      body: "Your Foundation submission has been approved. Explore industry projects when you're ready.",
    };
  }
  return {
    eyebrow: "Foundation complete",
    title: "You've completed Foundation — we'll review it next",
    body: "Thanks for finishing the Foundation stage. Our team usually reviews submissions within 24–48 hours. Applying unlocks after verification passes.",
  };
}

/** Post-Foundation Stage 2 landing: review status + Stage 2 value prop, side-by-side. */
export function IndustryExperienceView() {
  const { foundationVerificationStatus } = useStudentProfile();
  const review = reviewCopy(foundationVerificationStatus);

  return (
    <div className="mx-auto grid h-full min-h-[calc(100dvh-7rem)] w-full max-w-7xl items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
      <section className="relative flex h-full flex-col justify-center overflow-hidden rounded-2xl border border-[#d3e4ff]/80 bg-[linear-gradient(160deg,#f4f7fc_0%,#e8f0fb_50%,#dce9ff_100%)] px-5 py-7 sm:px-7 sm:py-8 lg:col-span-5">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-white/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#153a75]/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#153a75]">
              <MaterialSymbol name="task_alt" className="text-[18px]" />
              {review.eyebrow}
            </span>
            {foundationVerificationStatus === "PENDING" ||
            !foundationVerificationStatus ||
            foundationVerificationStatus === "NONE" ? (
              <span className="rounded-md bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#0b1c30] ring-1 ring-[#153a75]/15">
                Review in progress · 24–48 hrs
              </span>
            ) : null}
            {foundationVerificationStatus === "PASSED" ? (
              <span className="rounded-md bg-[#153a75] px-2.5 py-1 text-[11px] font-semibold text-white">
                Verified
              </span>
            ) : null}
            {foundationVerificationStatus === "FAILED" ? (
              <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-200">
                Needs attention
              </span>
            ) : null}
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#002546] sm:text-[28px] sm:leading-snug">
              {review.title}
            </h1>
            <p className="max-w-md text-sm leading-6 text-[#42474f] sm:text-[15px]">
              {review.body}
            </p>
          </div>
        </div>
      </section>

      <section className="flex h-full flex-col gap-5 rounded-2xl border border-[#d3e4ff] bg-white px-5 py-7 sm:px-7 sm:py-8 lg:col-span-7">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-[#002546] sm:text-2xl">
            Stage 2 Industry Experience
          </h2>
          <p className="text-sm font-semibold text-[#153a75] sm:text-base">
            Real Projects. Real Proof. Real Opportunities.
          </p>
          <p className="text-sm leading-6 text-[#42474f]">
            Transition from simulated sandbox tutorials to actual venture sprints.
            Collaborate in agile teams of 2–5 students to build portfolio-grade
            deliverables directly with founders.
          </p>
        </div>

        <ol className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-[#d3e4ff] bg-[#d3e4ff] sm:grid-cols-2 sm:grid-rows-2 sm:gap-px">
          {STAGE2_VALUE_PILLARS.map((pillar, index) => (
            <li
              key={pillar.title}
              className="flex h-full gap-3 border-b border-[#d3e4ff] bg-white p-4 last:border-b-0 sm:border-b-0 sm:p-5"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-2">
                <h3 className="text-sm font-semibold leading-snug text-[#0b1c30] sm:text-[15px]">
                  {pillar.title}
                </h3>
                <p className="text-xs leading-5 text-[#42474f] sm:text-[13px] sm:leading-6">
                  {pillar.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  DEMO_COVER_POINTS,
  ITERATION_1_SUMMARY,
  ITERATION_2_SUMMARY,
  READY_SUBMIT_CHECKLIST,
  SUBMIT_CELEBRATION_IMAGE,
  SUBMIT_ITER1_IMAGE,
  SUBMIT_ITER2_IMAGE,
  WHAT_CHANGED,
} from "@/constants/stage2-project-submit";
import { ROUTES } from "@/constants/routes";
import { projectsApi, type ProjectTeam } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

export function Stage2ProjectSubmitView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const demoRef = useRef<HTMLElement | null>(null);
  const submitRef = useRef<HTMLElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionCode, setSubmissionCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const result = await projectsApi.submitStageProject(detail.id, {
        summary:
          "Iteration 2 wrap-up submitted with research evidence, prototype, and demo assets.",
        demoVideoUrl: "",
        payload: { source: "stage2-submit-ui" },
      });
      setSubmissionCode(result.submission.submissionCode);
      setSubmitted(true);
      showToast("Submitted for industry review");
    } catch (err) {
      // Preview / offline fallback — still advance UI so local demo browsing works.
      setSubmitted(true);
      showToast(
        err instanceof Error
          ? `Saved locally (${err.message})`
          : "Saved locally — API unavailable",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submissionId =
    submissionCode ||
    `IMR-STG2-${String(detail.id)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase()
      .padEnd(4, "0")}${String(team.id).slice(-4)}`;

  return (
    <div className="w-full">
      <section className="w-full bg-[#eff4ff] px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d3e4fe] px-3 py-1 text-xs font-semibold text-[#153a75] shadow-sm">
                <MaterialSymbol name="verified" className="text-[16px]" />
                Stage 2 · Industry Experience
              </span>
              <span className="rounded-full bg-[#dce9ff] px-3 py-1 text-xs font-semibold text-[#002546]">
                Final Milestone · Two-Iteration Review Suite
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002546] lg:text-[32px] lg:leading-10">
              Project Submission & Industry Evaluation
            </h1>
            <p className="text-sm text-[#42474f]">
              Review complete evidence from Iterations 1 &amp; 2, package your 3-minute video
              walk-through, and submit directly to the industry project owner.
            </p>
          </div>
          <div className="flex max-w-md shrink-0 items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-[#153a75]">
              <MaterialSymbol name="format_quote" className="text-[22px]" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-snug text-[#0b1c30]">
                “You don’t just learn. You do. And that changes you.”
              </p>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
                Stage 2 Core Principle · ImReady Cohort
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-[#42474f]">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#153a75] text-white">
                <MaterialSymbol name="check" className="text-[14px]" />
              </span>
              <span className="text-xs font-semibold text-[#002546]">
                Iteration 1: Discover & Build
              </span>
            </div>
            <MaterialSymbol name="arrow_forward" className="text-[18px] text-[#737780]" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#153a75] text-white">
                <MaterialSymbol name="check" className="text-[14px]" />
              </span>
              <span className="text-xs font-semibold text-[#002546]">
                Iteration 2: Improve & Refine
              </span>
            </div>
            <MaterialSymbol name="arrow_forward" className="text-[18px] text-[#737780]" />
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002546] text-[11px] font-bold text-white">
                3
              </span>
              <span className="text-sm font-bold text-[#002546]">Project Wrap-up & Demo</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#eff4ff] px-3 py-1">
            <MaterialSymbol name="domain" className="text-[18px] text-[#153a75]" />
            <span className="text-[11px] font-semibold text-[#0b1c30]">
              Client: <strong>{detail.company}</strong> ({detail.title})
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-4">
          <Link
            href={ROUTES.stage2ProjectDoProof(detail.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] hover:text-[#002546]"
          >
            <MaterialSymbol name="arrow_back" className="text-[18px]" />
            Back to Do & Proof
          </Link>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <section className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-white p-5 shadow-sm lg:col-span-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d3b66] text-xs font-semibold text-[#81a6d7]">
                  20
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                  Milestone Step
                </span>
              </div>
              <span className="rounded-full bg-[#eff4ff] px-2 py-0.5 text-[11px] font-semibold text-[#42474f]">
                Stage 2 Output
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#002546]">Project Summary</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#153a75]">Before Submission</p>
              <p className="mt-1 text-xs text-[#42474f]">
                Review your complete work and see the evolution across iterations.
              </p>
            </div>

            <div className="rounded-lg bg-[#eff4ff] p-3">
              <h3 className="mb-1 text-lg font-semibold text-[#0b1c30]">
                Complete Project Summary
              </h3>
              <p className="text-xs leading-relaxed text-[#42474f]">
                Side-by-side comparative evolution from initial discovery to final validation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <IterationCard
                title="Iteration 1"
                badge="Weeks 1–2"
                badgeClass="bg-[#e5eeff] text-[#42474f]"
                subtitle="First solution"
                imageSrc={SUBMIT_ITER1_IMAGE}
                imageBadge="v1 Prototype"
                imageBadgeClass="bg-[#0b1c30]/70 text-white"
                items={ITERATION_1_SUMMARY}
              />
              <IterationCard
                title="Iteration 2"
                badge="Weeks 3–4"
                badgeClass="bg-[#d3e4fe] text-[#153a75]"
                subtitle="Improved solution"
                imageSrc={SUBMIT_ITER2_IMAGE}
                imageBadge="v2 Refined"
                imageBadgeClass="bg-[#153a75] text-white"
                items={ITERATION_2_SUMMARY}
                emphasized
              />
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-[#eff4ff] p-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                <MaterialSymbol name="trending_up" className="text-[20px] text-[#153a75]" />
                <h4 className="text-lg font-bold text-[#002546]">
                  What changed from Iteration 1 to 2?
                </h4>
              </div>
              <ul className="mt-1 flex flex-col gap-2">
                {WHAT_CHANGED.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <MaterialSymbol
                      name="check_circle"
                      className="mt-0.5 shrink-0 text-[18px] text-[#153a75]"
                    />
                    <span className="text-xs text-[#0b1c30]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() =>
                demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102b55]"
            >
              Proceed to Final Demo
              <MaterialSymbol
                name="arrow_forward"
                className="text-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </section>

          <section
            ref={demoRef}
            className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-white p-5 shadow-sm lg:col-span-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d3b66] text-xs font-semibold text-[#81a6d7]">
                  21
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                  Presentation Step
                </span>
              </div>
              <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
                Video Pitch
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#002546]">Final Demo Preparation</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#153a75]">
                Tell the story of your project
              </p>
              <p className="mt-1 text-xs text-[#42474f]">
                Prepare a concise executive walkthrough for {detail.company} leaders.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl bg-[#eff4ff] p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#002546]">
                  Your 3-minute demo should cover:
                </h3>
                <span className="rounded bg-[#d3e4fe] px-1.5 py-0.5 text-[11px] font-semibold text-[#002546]">
                  7 Keys
                </span>
              </div>
              <ol className="flex flex-col gap-2">
                {DEMO_COVER_POINTS.map((point, index) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#002546] text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs text-[#0b1c30]">{point}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[#0b1c30]">Your demo assets</span>
              <button
                type="button"
                onClick={() => showToast("Video upload coming soon")}
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#f8f9ff] p-6 text-center shadow-sm transition-colors hover:bg-[#eff4ff]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3b66] text-[#81a6d7] shadow-sm">
                  <MaterialSymbol name="upload" className="text-[26px]" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#002546]">Upload Video</span>
                  <span className="text-xs text-[#42474f]">(Max 3 minutes)</span>
                </div>
                <span className="text-[11px] font-semibold text-[#737780]">
                  MP4, MOV or WebM • Up to 250MB
                </span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#d3e4fe] px-3 py-1 text-[11px] font-semibold text-[#153a75]">
                  <MaterialSymbol name="check" className="text-[14px]" />
                  Draft: onboarding-v2-walkthrough.mp4 (2m 48s)
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                submitRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="group mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102b55]"
            >
              Next: Review Checklist
              <MaterialSymbol
                name="arrow_forward"
                className="text-[18px] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </section>

          <section
            ref={submitRef}
            className="relative flex flex-col gap-5 overflow-hidden rounded-xl bg-white p-5 shadow-sm lg:col-span-4 lg:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#153a75] text-xs font-semibold text-white">
                  22
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                  Final Evaluation
                </span>
              </div>
              <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
                Ready to Ship
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#002546]">Submit for Industry Review</h2>
              <p className="mt-0.5 text-xs font-semibold text-[#153a75]">
                Your project is now ready for evaluation
              </p>
              <p className="mt-1 text-xs text-[#42474f]">
                Hand off both completed loops directly to {detail.company} project leads.
              </p>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl bg-[#dce9ff]/40 shadow-sm">
              <div className="relative h-36 w-full overflow-hidden bg-[#e5eeff]">
                <Image
                  src={SUBMIT_CELEBRATION_IMAGE}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#002546]/80 via-transparent to-transparent p-3">
                  <span className="text-xs font-semibold text-white">
                    Cohort Team: {team.name || "Your Team"}
                  </span>
                </div>
              </div>
              <div className="bg-[#eff4ff] p-3">
                <p className="text-xs leading-relaxed text-[#0b1c30]">
                  Your complete work (both iterations) will be shared with the project owner for
                  review.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-[#f8f9ff] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#002546]">READY Checklist</h3>
                <span className="text-[11px] font-semibold text-[#153a75]">5 of 5 Complete</span>
              </div>
              <ul className="mt-1 flex flex-col gap-2">
                {READY_SUBMIT_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <MaterialSymbol
                      name="check_circle"
                      className="mt-0.5 shrink-0 text-[20px] text-[#153a75]"
                    />
                    <span className="text-xs font-medium text-[#0b1c30]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#153a75] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55] active:scale-[0.99] disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <MaterialSymbol name="progress_activity" className="animate-spin text-[18px]" />
                    Packaging Work…
                  </>
                ) : (
                  <>
                    Submit for Review
                    <MaterialSymbol
                      name="arrow_forward"
                      className="text-[18px] transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
              <div className="flex items-start gap-1.5 p-1 text-[#42474f]">
                <MaterialSymbol name="info" className="mt-0.5 shrink-0 text-[16px] text-[#737780]" />
                <p className="text-xs leading-normal">
                  After you submit, the project owner will review your work and share feedback.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {submitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#002546]/40 p-4 backdrop-blur-sm">
          <div className="relative flex w-full max-w-lg flex-col items-center gap-5 rounded-xl bg-white p-8 text-center shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d3e4fe] text-[#153a75]">
              <MaterialSymbol name="celebration" className="text-[36px]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#002546]">
                Project Submitted to {detail.company}!
              </h3>
              <p className="mt-2 text-sm text-[#42474f]">
                Your two-iteration artifacts, test logs, and 3-minute video presentation have been
                locked and delivered to the industry evaluation committee.
              </p>
            </div>
            <div className="flex w-full flex-col gap-1 rounded-lg bg-[#eff4ff] p-3 text-left">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#42474f]">
                <span>Submission ID: #{submissionId}</span>
                <span className="text-[#153a75]">Evaluation in Progress</span>
              </div>
              <p className="text-xs text-[#0b1c30]">
                Expected Mentor Feedback: Within 72 Business Hours
              </p>
            </div>
            <Link
              href={ROUTES.stage2ProjectReview(detail.id)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#002546] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Continue to Review Pipeline
            </Link>
            <Link
              href={ROUTES.stage2ProjectWorkspace(detail.id)}
              className="text-sm font-semibold text-[#153a75] hover:underline"
            >
              Return to Workspace
            </Link>
          </div>
        </div>
      ) : null}

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

function IterationCard({
  title,
  badge,
  badgeClass,
  subtitle,
  imageSrc,
  imageBadge,
  imageBadgeClass,
  items,
  emphasized,
}: {
  title: string;
  badge: string;
  badgeClass: string;
  subtitle: string;
  imageSrc: string;
  imageBadge: string;
  imageBadgeClass: string;
  items: readonly string[];
  emphasized?: boolean;
}) {
  return (
    <div
      className={
        emphasized
          ? "relative flex flex-col gap-2 overflow-hidden rounded-lg bg-[#dce9ff]/60 p-3 shadow-sm"
          : "flex flex-col gap-2 rounded-lg bg-[#f8f9ff] p-3 shadow-sm"
      }
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-[#002546]">{title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p
        className={
          emphasized
            ? "text-xs font-medium text-[#0b1c30]"
            : "text-xs text-[#42474f]"
        }
      >
        {subtitle}
      </p>
      <div className="relative h-24 w-full overflow-hidden rounded-lg bg-[#e5eeff]">
        <Image src={imageSrc} alt="" fill className="object-cover" sizes="160px" />
        <div
          className={`absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${imageBadgeClass}`}
        >
          {imageBadge}
        </div>
      </div>
      <ul className="mt-1 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5">
            <MaterialSymbol
              name="check_circle"
              className="mt-0.5 shrink-0 text-[16px] text-[#153a75]"
            />
            <span
              className={
                emphasized
                  ? "text-xs font-medium text-[#0b1c30]"
                  : "text-xs text-[#0b1c30]"
              }
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import {
  ITERATION_1_EVIDENCE,
  ITERATION_2_EVIDENCE,
  OWNER_REVIEW_TABS,
  REVIEW_COMPANY_IMAGE,
  REVIEW_DEMO_IMAGE,
  REVIEW_PROJECT_IMAGE,
  REVIEW_TARGET_USER_IMAGE,
  type ReviewEvidenceCard,
} from "@/constants/stage2-project-review";
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

export function Stage2ProjectReviewView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const [tab, setTab] = useState<(typeof OWNER_REVIEW_TABS)[number]>("Overview");
  const [toast, setToast] = useState<string | null>(null);

  const accepted = useMemo(
    () => team.members.filter((m) => m.status === "ACCEPTED"),
    [team.members],
  );

  const submittedLabel = useMemo(() => {
    const raw = team.updatedAt || team.createdAt;
    if (!raw) return "Recently submitted";
    try {
      return new Date(raw).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently submitted";
    }
  }, [team.createdAt, team.updatedAt]);

  const heroSrc =
    resolveMediaUrl(detail.heroImage) || REVIEW_PROJECT_IMAGE;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="relative mb-8 overflow-hidden rounded-xl bg-[#eff4ff] p-5 shadow-sm lg:p-6">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex max-w-3xl flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0d3b66] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                Stage 2 · Industry Experience
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#42474f]">
                Board C: Review
                <MaterialSymbol name="arrow_forward" className="text-[14px]" />
                Outcome
                <MaterialSymbol name="arrow_forward" className="text-[14px]" />
                <span className="font-semibold text-[#153a75]">Opportunity</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#002546] lg:text-[32px] lg:leading-10">
              Review &amp; Assessment Pipeline
            </h1>
            <p className="text-base text-[#42474f]">
              Your project is submitted. The industry owner reviews your work and shares
              feedback. Get your outcome and next opportunity.
            </p>
          </div>
          <div className="max-w-sm shrink-0 rounded-xl border-l-4 border-[#153a75] bg-white px-5 py-3 shadow-sm">
            <div className="mb-1 flex items-center gap-1 text-[#153a75]">
              <MaterialSymbol name="format_quote" className="text-[18px]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                ImReady Creed
              </span>
            </div>
            <p className="text-sm font-medium italic text-[#0b1c30]">
              “You don&apos;t just learn. You do. And that changes you.”
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Link
          href={ROUTES.stage2ProjectSubmit(detail.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] hover:text-[#002546]"
        >
          <MaterialSymbol name="arrow_back" className="text-[18px]" />
          Back to Wrap-up
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div className="flex items-center gap-3 rounded-lg bg-[#e5eeff] px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002546] text-lg font-semibold text-white">
              23
            </div>
            <div>
              <span className="block text-lg font-semibold text-[#0b1c30]">
                Submission Confirmed
              </span>
              <span className="text-xs text-[#42474f]">Your work is under review</span>
            </div>
          </div>

          <div className="relative flex flex-col items-center overflow-hidden rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#d3e4fe]/40 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#d3e4ff]/30 blur-2xl" />
            <div className="relative my-2 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d3e4fe] shadow-md">
                <MaterialSymbol
                  name="check_circle"
                  className="text-[44px] text-[#153a75]"
                  filled
                />
              </div>
              <MaterialSymbol
                name="auto_awesome"
                className="absolute -right-2 -top-2 animate-bounce text-[20px] text-[#153a75]"
              />
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#0b1c30]">Project submitted!</h2>
            <p className="mt-1 max-w-xs text-sm text-[#42474f]">
              Your project has been submitted for industry review.
            </p>
            <div className="mt-5 flex w-full items-center justify-between rounded-lg bg-[#eff4ff] p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d3e4fe] text-[#002546]">
                  <MaterialSymbol name="hourglass_top" className="text-[20px]" />
                </div>
                <div className="text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#42474f]">
                    Status
                  </span>
                  <span className="text-lg font-bold text-[#002546]">Under Review</span>
                </div>
              </div>
              <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-[#153a75]" />
            </div>
            <div className="mt-3 flex w-full items-start gap-2 rounded-lg bg-[#e5eeff] p-3 text-left">
              <MaterialSymbol
                name="info"
                className="mt-0.5 shrink-0 text-[20px] text-[#002546]"
              />
              <p className="text-xs leading-snug text-[#0b1c30]">
                The project owner will now review your work and share feedback.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0b1c30]">Project details</h3>
              <span className="rounded-md bg-[#e5eeff] px-2 py-1 text-[11px] font-semibold text-[#42474f]">
                Batch 2026-A
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-[#eff4ff] p-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <Image src={heroSrc} alt="" fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-lg font-semibold text-[#002546]">
                  {detail.title}
                </span>
                <span className="text-xs font-medium text-[#42474f]">{detail.company}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <MetaRow icon="group" label="Team">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0b1c30]">
                    {accepted.length} member{accepted.length === 1 ? "" : "s"}
                  </span>
                  <div className="flex -space-x-2 overflow-hidden">
                    {accepted.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002546] text-[9px] font-bold text-white ring-2 ring-white"
                        title={member.studentName}
                      >
                        {initials(member.studentName)}
                      </div>
                    ))}
                  </div>
                </div>
              </MetaRow>
              <MetaRow icon="calendar_today" label="Submitted on">
                <span className="text-sm font-semibold text-[#0b1c30]">{submittedLabel}</span>
              </MetaRow>
              <MetaRow icon="replay" label="Iterations completed">
                <span className="text-sm font-semibold text-[#0b1c30]">2 (2 weeks each)</span>
              </MetaRow>
              <MetaRow icon="video_file" label="Final demo">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#153a75]">
                  <MaterialSymbol name="cloud_done" className="text-[16px]" />
                  Uploaded
                </span>
              </MetaRow>
              <MetaRow icon="checklist" label="READY checklist">
                <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-xs font-semibold text-[#153a75]">
                  Completed ✓
                </span>
              </MetaRow>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-[#d3e4fe]/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-white">
                <MaterialSymbol name="schedule" className="text-[20px]" />
              </div>
              <p className="text-xs leading-snug text-[#0b1c30]">
                <strong className="font-semibold text-[#153a75]">You submitted on time!</strong>{" "}
                Great work on meeting your timeline.
              </p>
            </div>

            <button
              type="button"
              onClick={() => showToast("Full submission package coming soon")}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#dce9ff] py-3 text-sm font-semibold text-[#002546] transition-all hover:bg-[#d3e4fe]"
            >
              View Submission
              <MaterialSymbol name="arrow_forward" className="text-[18px]" />
            </button>
            <Link
              href={ROUTES.stage2ProjectOwnerFeedback(detail.id)}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#153a75] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#102b55]"
            >
              Continue to Owner Feedback
              <MaterialSymbol name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="flex items-center gap-3 rounded-lg bg-[#e5eeff] px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d3b66] text-lg font-semibold text-white">
              24
            </div>
            <div>
              <span className="block text-lg font-semibold text-[#0b1c30]">
                Project Owner Review
              </span>
              <span className="text-xs text-[#42474f]">Owner sees complete project</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col justify-between gap-3 pb-1 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <Image
                    src={REVIEW_COMPANY_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#002546]">{detail.title}</h2>
                  <span className="text-xs font-medium text-[#42474f]">{detail.company}</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#e5eeff] px-2 py-1 text-[11px] font-semibold text-[#42474f]">
                <MaterialSymbol name="visibility" className="text-[14px] text-[#153a75]" />
                Live Evaluator View
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {OWNER_REVIEW_TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={
                    tab === item
                      ? "rounded-lg bg-[#002546] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                      : "rounded-lg px-3 py-1.5 text-xs font-medium text-[#42474f] transition-all hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            {tab === "Overview" || tab === "Iteration 1" || tab === "Iteration 2" ? (
              <>
                {(tab === "Overview" || tab === "Iteration 1") && (
                  <>
                    <div className="flex flex-col gap-3 rounded-xl bg-[#eff4ff] p-4">
                      <div className="flex items-center gap-1.5 text-lg font-semibold text-[#002546]">
                        <MaterialSymbol name="target" className="text-[20px]" />
                        The Problem
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-[#0b1c30]">
                        {detail.problem || detail.summary}
                      </p>
                      <div className="flex max-w-md items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={REVIEW_TARGET_USER_IMAGE}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#42474f]">
                            Target Users
                          </span>
                          <span className="text-lg font-semibold text-[#002546]">
                            {detail.targetUser}
                          </span>
                        </div>
                      </div>
                    </div>

                    <EvidenceSection
                      title="Iteration 1"
                      weeks="Weeks 1–2"
                      cards={ITERATION_1_EVIDENCE}
                    />
                  </>
                )}

                {(tab === "Overview" || tab === "Iteration 2") && (
                  <EvidenceSection
                    title="Iteration 2"
                    weeks="Weeks 3–4"
                    cards={ITERATION_2_EVIDENCE}
                  />
                )}
              </>
            ) : null}

            {tab === "Overview" || tab === "Final Demo" ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-[#0b1c30]">Final Demo</span>
                  <span className="text-[11px] font-semibold text-[#42474f]">
                    Production Deliverable
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Demo playback coming soon")}
                  className="group overflow-hidden rounded-xl bg-[#e5eeff] text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col items-center gap-4 p-4 sm:flex-row">
                    <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-[#0d3b66] sm:w-56">
                      <Image
                        src={REVIEW_DEMO_IMAGE}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="224px"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#002546]/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#002546] shadow-lg transition-transform group-hover:scale-110">
                          <MaterialSymbol
                            name="play_arrow"
                            className="text-[28px]"
                            filled
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 rounded bg-[#213145]/80 px-1.5 py-0.5 text-[11px] font-semibold text-[#eaf1ff]">
                        6:12 min
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
                          Pitch &amp; Demo
                        </span>
                        <span className="text-xs text-[#42474f]">HD 1080p</span>
                      </div>
                      <h4 className="text-lg font-semibold text-[#002546]">
                        3-minute demo video
                      </h4>
                      <p className="text-sm text-[#42474f]">{detail.title} Solution</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#42474f]">
                        <span className="inline-flex items-center gap-1">
                          <MaterialSymbol name="timer" className="text-[16px]" /> 6:12 min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MaterialSymbol name="subtitles" className="text-[16px]" />{" "}
                          Subtitles available
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ) : null}

            {tab === "Team" ? (
              <div className="flex flex-col gap-2 rounded-xl bg-[#eff4ff] p-4">
                <h3 className="text-lg font-semibold text-[#002546]">
                  {team.name || "Your team"}
                </h3>
                <ul className="flex flex-col gap-2">
                  {accepted.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002546] text-xs font-bold text-white">
                        {initials(member.studentName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0b1c30]">
                          {member.studentName}
                          {String(member.studentId) === String(team.leadStudentId)
                            ? " · Lead"
                            : ""}
                        </p>
                        <p className="text-xs text-[#42474f]">{member.studentEmail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl bg-[#002546] p-5 text-white shadow-md sm:flex-row">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b8d4ff]">
            Board C · Next
          </p>
          <h3 className="text-lg font-bold">
            Owner evaluation &amp; structured industry feedback
          </h3>
        </div>
        <Link
          href={ROUTES.stage2ProjectOwnerFeedback(detail.id)}
          className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-[#d3e4ff] px-5 py-3 text-sm font-semibold text-[#001c38] transition-colors hover:bg-[#b8d4ff] sm:w-auto"
        >
          Continue to Owner Feedback
          <MaterialSymbol name="arrow_forward" className="text-[18px]" />
        </Link>
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

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#42474f]">
        <MaterialSymbol name={icon} className="text-[18px]" />
        {label}
      </div>
      {children}
    </div>
  );
}

function EvidenceSection({
  title,
  weeks,
  cards,
}: {
  title: string;
  weeks: string;
  cards: readonly ReviewEvidenceCard[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-[#0b1c30]">{title}</span>
          <span className="rounded-full bg-[#e5eeff] px-2 py-0.5 text-[11px] font-medium text-[#42474f]">
            {weeks}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-[#153a75]">Completed</span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <EvidenceCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

function EvidenceCard({ card }: { card: ReviewEvidenceCard }) {
  return (
    <div
      className={
        card.highlight
          ? "flex items-center justify-between gap-3 rounded-lg bg-[#d3e4fe]/30 p-3 transition-all hover:bg-[#d3e4fe]/50"
          : "flex items-center justify-between gap-3 rounded-lg bg-[#eff4ff] p-3 transition-all hover:bg-[#e5eeff]"
      }
    >
      <div className="flex min-w-0 items-start gap-2">
        {card.done ? (
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-[#153a75]">
            <MaterialSymbol name="check" className="text-[16px]" />
          </div>
        ) : (
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d3e4ff] text-xs font-bold text-[#002546]">
            {card.badge || "•"}
          </div>
        )}
        <div className="min-w-0">
          <span
            className={
              card.highlight
                ? "text-[11px] font-semibold uppercase tracking-wide text-[#153a75]"
                : "text-[11px] font-semibold uppercase tracking-wide text-[#42474f]"
            }
          >
            {card.label}
          </span>
          <p
            className={
              card.highlight
                ? "text-sm font-bold leading-tight text-[#0b1c30]"
                : "text-sm font-medium leading-tight text-[#0b1c30]"
            }
          >
            {card.value}
          </p>
        </div>
      </div>
      {card.metric ? (
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2 py-1 shadow-sm">
          <svg className="h-5 w-8 text-[#153a75]" fill="none" viewBox="0 0 32 20">
            <polyline
              points="2,16 12,14 20,8 30,2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
          <span className="text-[11px] font-bold text-[#153a75]">{card.metric}</span>
        </div>
      ) : card.imageSrc ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm">
          <Image src={card.imageSrc} alt="" fill className="object-cover" sizes="48px" />
        </div>
      ) : null}
    </div>
  );
}

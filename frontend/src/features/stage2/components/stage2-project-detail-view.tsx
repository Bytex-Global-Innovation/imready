"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { type Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { MaterialSymbol } from "./material-symbol";

type DetailTab = "overview" | "details" | "owner" | "teams";

const TABS: ReadonlyArray<{
  id: DetailTab;
  label: string;
  badge?: number;
}> = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details & Scope" },
  { id: "owner", label: "About Owner" },
  { id: "teams", label: "Active Teams", badge: 2 },
];

const ACTIVE_TEAMS = [
  {
    id: "alpha",
    name: "Team Alpha",
    members: 3,
    capacity: 5,
    focus: "User research & journey mapping",
  },
  {
    id: "nova",
    name: "Team Nova",
    members: 4,
    capacity: 5,
    focus: "Prototype & validation sprint",
  },
  {
    id: "orbit",
    name: "Team Orbit",
    members: 2,
    capacity: 5,
    focus: "Product specs & prioritization",
  },
  {
    id: "pulse",
    name: "Team Pulse",
    members: 5,
    capacity: 5,
    focus: "Data insights & metrics review",
  },
] as const;

function formatApplyDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function Stage2ProjectDetailView({ detail }: { detail: Stage2ProjectDetail }) {
  const applyHref = ROUTES.stage2ProjectApply(detail.id);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const canApply = detail.applicationsOpen && !detail.applicationsClosed;

  const applyLinkClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#153a75] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#102b55] active:translate-y-0 sm:w-auto";

  const teamBadge = useMemo(() => ACTIVE_TEAMS.length, []);
  const applyOpensLabel = formatApplyDate(detail.applyOpensAt);
  const applyClosesLabel = formatApplyDate(detail.applyClosesAt);

  const applyWindowMessage = detail.applicationsClosed
    ? "Applications closed"
    : detail.applicationsNotYetOpen
      ? applyOpensLabel
        ? `Applications open on ${applyOpensLabel}`
        : "Applications not open yet"
      : detail.remainingDays != null
        ? detail.remainingDays === 0
          ? "Last day to apply"
          : `${detail.remainingDays} day${detail.remainingDays === 1 ? "" : "s"} left to apply`
        : applyClosesLabel
          ? `Apply by ${applyClosesLabel}`
          : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[#e5eeff] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#153a75]" />
            <span className="text-xs font-medium text-[#42474f]">
              Stage 2 · Industry Experience{" "}
              <span className="text-[#737780]">/</span>{" "}
              <strong className="font-semibold text-[#0b1c30]">Student Discovery</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-xl bg-[#eff4ff] p-4 shadow-sm md:flex-row md:items-center md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0d3b66] text-white">
              <MaterialSymbol name="verified" className="text-[24px]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-lg font-semibold text-[#002546]">
                  Stage 2: Real Problems. Real People.
                </span>
                <span className="rounded bg-[#b8d4ff] px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#001c38]">
                  Live Cohort
                </span>
              </div>
              <p className="text-xs text-[#42474f]">
                From Foundation completion to joining a verified real-world project team.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8 self-end md:self-center">
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                Cohort Progress
              </span>
              <span className="text-sm font-bold text-[#153a75]">
                Step 6 of 10: Evaluation
              </span>
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-[#d3e4fe]">
              <div className="h-full w-[60%] rounded-full bg-[#153a75]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-white shadow-md">
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-6 sm:flex-row">
              <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-lg bg-[#e5eeff] shadow-sm sm:w-44">
                <Image
                  src={detail.heroImage}
                  alt={detail.heroImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 100vw, 176px"
                  priority
                />
                <div className="absolute left-2 top-2 rounded bg-[#002546] px-1 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {detail.featuredLabel}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-[#42474f]">
                    <MaterialSymbol name="domain" className="text-[16px]" />
                    {detail.company}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#b8d4ff]/40 px-1 py-0.5 text-[11px] font-semibold text-[#001c38]">
                    <MaterialSymbol
                      name="check_circle"
                      className="text-[14px] text-[#153a75]"
                      filled
                    />
                    Verified Project Owner
                  </span>
                </div>
                <h1 className="text-[32px] font-bold leading-10 tracking-tight text-[#002546]">
                  {detail.title}
                </h1>
                <p className="line-clamp-2 text-sm text-[#42474f]">{detail.summary}</p>
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-medium text-[#002546]">
                    <MaterialSymbol name="category" className="text-[15px]" />
                    {detail.categoryPill}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-medium text-[#002546]">
                    <MaterialSymbol name="schedule" className="text-[15px]" />
                    {detail.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-medium text-[#002546]">
                    <MaterialSymbol name="groups" className="text-[15px]" />
                    {detail.teamSize}
                  </span>
                  {detail.pillTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-[#dce9ff] px-3 py-1 text-[11px] font-semibold text-[#0b1c30]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col items-stretch gap-2 lg:w-auto lg:items-end">
              {canApply ? (
                <Link href={applyHref} className={applyLinkClass}>
                  Apply to this project
                  <MaterialSymbol name="arrow_forward" className="text-[18px]" />
                </Link>
              ) : (
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c3c6d0] px-6 py-3 text-sm font-semibold text-white sm:w-auto">
                  {detail.applicationsClosed ? "Applications closed" : "Applications not open"}
                </span>
              )}
              {applyWindowMessage ? (
                <span className="text-center text-[11px] font-semibold text-[#153a75] lg:text-right">
                  {applyWindowMessage}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Project sections"
          className="flex items-center gap-1 overflow-x-auto border-t border-[#e5eeff] bg-[#eff4ff] px-4 sm:gap-2 sm:px-6 lg:px-8"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const badge = tab.id === "teams" ? teamBadge : tab.badge;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                id={`project-tab-${tab.id}`}
                aria-controls={`project-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={
                  isActive
                    ? "relative flex shrink-0 items-center gap-1.5 border-b-2 border-[#002546] px-3 py-3 text-sm font-bold text-[#002546]"
                    : "relative flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-[#42474f] transition-colors hover:text-[#002546]"
                }
              >
                {tab.label}
                {badge != null ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d3e4fe] text-[11px] font-bold text-[#0b1c30]">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {activeTab === "overview" ? (
            <div
              role="tabpanel"
              id="project-panel-overview"
              aria-labelledby="project-tab-overview"
              className="flex flex-col gap-6"
            >
              <DetailSection
                icon="crisis_alert"
                iconClass="bg-[#ffdad6] text-[#ba1a1a]"
                label="Challenge 01"
                labelClass="text-[#ba1a1a]"
                badge="Severity: High"
                title="The problem"
              >
                <p className="text-base leading-6 text-[#0b1c30]">{detail.problem}</p>
              </DetailSection>

              <DetailSection
                icon="account_circle"
                iconClass="bg-[#0d3b66] text-white"
                label="User Segment"
                labelClass="text-[#0d3b66]"
                title="Target user"
              >
                <p className="text-base leading-6 text-[#0b1c30]">{detail.targetUser}</p>
              </DetailSection>

              <DetailSection
                icon="trending_up"
                iconClass="bg-[#d3e4fe] text-[#002546]"
                label="Strategic Impact"
                labelClass="text-[#153a75]"
                title="Why this matters"
              >
                <p className="text-base leading-6 text-[#0b1c30]">{detail.whyMatters}</p>
              </DetailSection>
            </div>
          ) : null}

          {activeTab === "details" ? (
            <div
              role="tabpanel"
              id="project-panel-details"
              aria-labelledby="project-tab-details"
              className="flex flex-col gap-6"
            >
              <DetailSection
                icon="handyman"
                iconClass="bg-[#b8d4ff] text-[#001c38]"
                label="Student Methodology"
                labelClass="text-[#153a75]"
                title="What you'll do"
              >
                <p className="mb-2 text-base leading-6 text-[#0b1c30]">{detail.whatYouDo}</p>
                <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                  {detail.processSteps.map((step, i) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 rounded-lg bg-[#eff4ff] p-3"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002546] text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#0b1c30]">{step}</span>
                    </div>
                  ))}
                </div>
              </DetailSection>

              <DetailSection
                icon="flag"
                iconClass="bg-[#ffdad6] text-[#ba1a1a]"
                label="Deliverable"
                labelClass="text-[#737780]"
                title="Expected outcome"
              >
                <p className="text-base leading-6 text-[#0b1c30]">{detail.expectedOutcome}</p>
              </DetailSection>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#002546]">Scope snapshot</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Duration", value: detail.duration, icon: "schedule" },
                    { label: "Team size", value: detail.teamSize, icon: "groups" },
                    { label: "Category", value: detail.categoryPill, icon: "category" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-[#eff4ff] p-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#737780]">
                        <MaterialSymbol name={item.icon} className="text-[16px]" />
                        {item.label}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#002546]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "owner" ? (
            <div
              role="tabpanel"
              id="project-panel-owner"
              aria-labelledby="project-tab-owner"
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#eff4ff] shadow-sm">
                    <MaterialSymbol name="corporate_fare" className="text-[36px] text-[#002546]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#153a75]">
                      Verified Project Owner
                    </span>
                    <h2 className="text-2xl font-bold text-[#002546]">{detail.company}</h2>
                    <p className="text-sm text-[#42474f]">{detail.companyBlurb}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#b8d4ff]/50 px-3 py-1 text-[11px] font-semibold text-[#001c38]">
                  <MaterialSymbol name="verified" className="text-[16px] text-[#153a75]" filled />
                  Partner Squad
                </span>
              </div>

              <DetailSection
                icon="handshake"
                iconClass="bg-[#0d3b66] text-white"
                label="Collaboration"
                labelClass="text-[#0d3b66]"
                title="How you'll work with the owner"
              >
                <ul className="space-y-2 text-sm leading-5 text-[#0b1c30]">
                  <li className="flex items-start gap-2">
                    <MaterialSymbol name="check" className="mt-0.5 text-[18px] text-[#153a75]" />
                    Weekly check-ins with the partner product or engineering lead
                  </li>
                  <li className="flex items-start gap-2">
                    <MaterialSymbol name="check" className="mt-0.5 text-[18px] text-[#153a75]" />
                    Access to brief context, constraints, and success metrics
                  </li>
                  <li className="flex items-start gap-2">
                    <MaterialSymbol name="check" className="mt-0.5 text-[18px] text-[#153a75]" />
                    Feedback on deliverables before final presentation
                  </li>
                </ul>
              </DetailSection>
            </div>
          ) : null}

          {activeTab === "teams" ? (
            <div
              role="tabpanel"
              id="project-panel-teams"
              aria-labelledby="project-tab-teams"
              className="flex flex-col gap-4"
            >
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold text-[#002546]">Active student teams</h2>
                    <p className="mt-1 text-sm text-[#42474f]">
                      Teams already forming on this project. Apply to join or start your own after
                      interest review.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#d3e4fe] px-3 py-1 text-[11px] font-bold text-[#0b1c30]">
                    {ACTIVE_TEAMS.length} active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ACTIVE_TEAMS.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-start gap-3 rounded-xl bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#002546]">
                      <MaterialSymbol name="groups" className="text-[24px]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#002546]">{team.name}</h3>
                      <p className="text-xs text-[#42474f]">{team.focus}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#737780]">
                        {team.members}/{team.capacity} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-8 lg:col-span-4">
          <SidebarCard title="What you'll gain" icon="stars">
            {detail.whatYouGain.map((line) => (
              <div key={line} className="flex items-start gap-2">
                <MaterialSymbol
                  name="check_circle"
                  className="shrink-0 text-[20px] text-[#153a75]"
                  filled
                />
                <span className="text-sm font-medium text-[#0b1c30]">{line}</span>
              </div>
            ))}
          </SidebarCard>

          <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#002546]">Project Logistics</h3>
            <LogisticsRow icon="calendar_today" label="Cohort Starts" value={detail.cohortStarts} />
            <LogisticsRow icon="timer" label="Duration" value={detail.duration} />
            <LogisticsRow icon="group" label="Team Size" value={detail.teamSize} />
            <LogisticsRow
              icon="school"
              label="Mentorship"
              value={detail.mentorshipLabel}
              valueClass="text-[#153a75]"
            />
            {applyOpensLabel || applyClosesLabel || detail.remainingDays != null ? (
              <LogisticsRow
                icon="event_available"
                label="Apply window"
                value={
                  detail.applicationsClosed
                    ? "Closed"
                    : detail.remainingDays != null
                      ? detail.remainingDays === 0
                        ? "Closes today"
                        : `${detail.remainingDays} day${detail.remainingDays === 1 ? "" : "s"} left`
                      : applyOpensLabel && applyClosesLabel
                        ? `${applyOpensLabel} → ${applyClosesLabel}`
                        : applyClosesLabel
                          ? `Until ${applyClosesLabel}`
                          : applyOpensLabel
                            ? `Opens ${applyOpensLabel}`
                            : "Open"
                }
                valueClass={detail.applicationsClosed ? "text-[#ba1a1a]" : "text-[#153a75]"}
              />
            ) : null}
            <div className="mt-1 flex flex-col gap-1 rounded-lg bg-[#dce9ff]/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0b1c30]">Team Formation Status</span>
                <span
                  className={`rounded px-1 py-0.5 text-[11px] font-bold text-white ${
                    detail.applicationsClosed ? "bg-[#737780]" : "bg-[#153a75]"
                  }`}
                >
                  {detail.applicationsClosed ? "Closed" : "Open"}
                </span>
              </div>
              <p className="text-xs text-[#42474f]">{detail.teamFormationNote}</p>
              {applyWindowMessage ? (
                <p className="text-xs font-semibold text-[#153a75]">{applyWindowMessage}</p>
              ) : null}
            </div>
            {canApply ? (
              <Link
                href={applyHref}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#153a75] py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55]"
              >
                Apply to this project
                <MaterialSymbol name="arrow_forward" className="text-[18px]" />
              </Link>
            ) : (
              <span className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c3c6d0] py-3 text-sm font-semibold text-white">
                {detail.applicationsClosed ? "Applications closed" : "Applications not open"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#eff4ff] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002546] text-white">
              <MaterialSymbol name="support_agent" className="text-[20px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#002546]">
                Need advice before applying?
              </span>
              <a href="#" className="text-[11px] font-semibold text-[#153a75] hover:underline">
                Speak with an Industry Mentor →
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailSection({
  icon,
  iconClass,
  label,
  labelClass,
  badge,
  title,
  children,
}: {
  icon: string;
  iconClass: string;
  label: string;
  labelClass: string;
  badge?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconClass}`}
      >
        <MaterialSymbol name={icon} className="text-[26px]" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${labelClass}`}>
            {label}
          </span>
          {badge ? (
            <span className="rounded bg-[#e5eeff] px-1 py-0.5 text-[11px] text-[#42474f]">
              {badge}
            </span>
          ) : null}
        </div>
        <h2 className="text-xl font-semibold text-[#002546]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function SidebarCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#002546]">{title}</h3>
        <MaterialSymbol name={icon} className="text-[22px] text-[#153a75]" />
      </div>
      <div className="flex flex-col gap-3 pt-1">{children}</div>
    </div>
  );
}

function LogisticsRow({
  icon,
  label,
  value,
  valueClass = "text-[#002546]",
}: {
  icon: string;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-1.5 text-xs text-[#42474f]">
        <MaterialSymbol name={icon} className="text-[16px]" />
        {label}
      </span>
      <span className={`text-xs font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

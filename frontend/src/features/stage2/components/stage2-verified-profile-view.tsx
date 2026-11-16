"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import type { ProjectTeam } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/api";
import { MaterialSymbol } from "./material-symbol";

type ProfileTab = "industry" | "projects" | "skills" | "feedback";

const READY_NODES = [
  { key: "R", name: "Reality", blurb: "Go see", color: "#f97316", done: false },
  { key: "E", name: "Engage", blurb: "Meet people", color: "#153a75", done: true },
  { key: "A", name: "Analyze", blurb: "Find patterns", color: "#153a75", done: true },
  { key: "D", name: "Do", blurb: "Build & test", color: "#0d3b66", done: false },
  { key: "Y", name: "Your Proof", blurb: "Show built", color: "#002e97", done: false },
] as const;

const INDUSTRY_SKILLS = ["Research", "Product Thinking", "Prototyping", "Testing"] as const;

export function Stage2VerifiedProfileView({
  detail,
  team,
}: {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
}) {
  const { student } = useStudentProfile();
  const [tab, setTab] = useState<ProfileTab>("industry");
  const [toast, setToast] = useState<string | null>(null);

  const acceptedCount = useMemo(
    () => team.members.filter((m) => m.status === "ACCEPTED").length,
    [team.members],
  );

  const displayName = student?.studentName?.trim() || "Student";
  const college =
    student?.collegeName?.trim() ||
    student?.college?.trim() ||
    "Your college";
  const locationBits = [student?.streamMajor, "India"].filter(Boolean).join(", ");
  const heroSrc =
    resolveMediaUrl(detail.heroImage) || "/images/projects/placeholder.jpg";
  const certId = `IR-${new Date().getFullYear()}-${String(team.id).slice(-4).padStart(4, "0")}`;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl bg-[#eff4ff] px-5 py-4 shadow-sm md:flex-row md:items-center lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002546] text-white">
            <MaterialSymbol name="workspace_premium" className="text-[22px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#153a75]">
                Stage 2 • Industry Experience
              </span>
              <span className="text-xs text-[#c3c6d0]">•</span>
              <span className="text-xs font-medium text-[#42474f]">
                Board C: Review → Outcome → Opportunity
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#002546]">
              Industry Verification &amp; Student Profile Accreditation
            </h1>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#d3e4fe] px-3 py-1.5 text-[11px] font-semibold text-[#153a75] shadow-sm md:self-auto">
          <MaterialSymbol name="check_circle" className="text-[16px]" />
          Dual Credentials Issued
        </span>
      </div>

      <div className="mb-4">
        <Link
          href={ROUTES.stage2ProjectOutcome(detail.id)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#42474f] hover:text-[#002546]"
        >
          <MaterialSymbol name="arrow_back" className="text-[18px]" />
          Back to Outcome
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d3b66] text-xs font-bold text-white">
                29
              </span>
              <span className="text-lg font-bold text-[#002546]">
                Verified Industry Project
              </span>
              <span className="hidden text-xs text-[#42474f] sm:inline">
                — This project appears in your profile
              </span>
            </div>
            <Link
              href={ROUTES.stage2ProjectWorkspace(detail.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#002546] hover:text-[#204874]"
            >
              ← Workspace
            </Link>
          </div>

          <div className="flex flex-col gap-6 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:col-span-7">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-[#dce9ff] shadow-sm sm:w-36">
                  <Image
                    src={heroSrc}
                    alt={detail.heroImageAlt || detail.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                  <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#153a75] shadow-sm backdrop-blur-md">
                    <MaterialSymbol name="verified" className="text-[12px]" />
                    Verified
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-[#e5eeff] px-2 py-0.5 text-[11px] font-medium text-[#42474f]">
                      Project Delivery
                    </span>
                    <span className="rounded bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-semibold text-[#153a75]">
                      Stage 2 Complete
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#002546]">{detail.title}</h2>
                  <span className="text-sm font-medium text-[#42474f]">{detail.company}</span>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <MetaChip
                      label="Industry"
                      value={detail.categoryPill || "SaaS"}
                    />
                    <MetaChip label="Duration" value={detail.duration || "4 weeks"} />
                    <MetaChip label="Role" value="Research & Product" />
                    <MetaChip
                      label="Team"
                      value={`${acceptedCount} member${acceptedCount === 1 ? "" : "s"}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-[#eff4ff] p-3 lg:col-span-5">
                <span className="text-center text-[11px] font-bold uppercase tracking-wider text-[#42474f]">
                  READY Framework Mastery
                </span>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {READY_NODES.map((node) => (
                    <div key={node.key} className="flex flex-col items-center text-center">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.done ? (
                          <MaterialSymbol name="check" className="text-[20px]" />
                        ) : (
                          node.key
                        )}
                      </div>
                      <span className="mt-1 text-[11px] font-semibold text-[#0b1c30]">
                        {node.name}
                      </span>
                      <span className="text-[10px] leading-tight text-[#42474f]">
                        {node.blurb}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-12">
              <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#eff4ff] p-4 shadow-sm md:col-span-8">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#42474f]">
                    <MaterialSymbol name="rate_review" className="text-[16px] text-[#153a75]" />
                    Industry Feedback
                  </span>
                  <div className="flex items-center text-[#eab308]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MaterialSymbol
                        key={i}
                        name="star"
                        className="text-[18px]"
                        filled
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm italic leading-relaxed text-[#0b1c30]">
                  “Great work! The team demonstrated strong learning and measurable improvement
                  between the two iterations.”
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d3b66] text-[10px] font-bold text-white">
                    RM
                  </div>
                  <span className="text-xs font-semibold text-[#002546]">
                    Industry Mentor, {detail.company}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#153a75]">
                    <MaterialSymbol name="task_alt" className="text-[14px]" />
                    Verified Review
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl bg-[#d3e4fe]/40 p-4 shadow-sm md:col-span-4">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#153a75]">
                    <MaterialSymbol name="emoji_events" className="text-[16px]" />
                    Outcome
                  </span>
                  <div className="mt-2 inline-block rounded-full bg-[#153a75] px-3 py-1 text-lg font-bold text-white shadow-sm">
                    Paid Continuation
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs font-semibold text-[#153a75]">
                    Selected for Stage 3
                  </span>
                  <MaterialSymbol name="arrow_forward" className="text-[24px] text-[#153a75]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d3b66] text-xs font-bold text-white">
                30
              </span>
              <span className="text-lg font-bold text-[#002546]">Student Profile Update</span>
              <span className="hidden text-xs text-[#42474f] sm:inline">
                — Your industry profile grows
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#153a75]">
              <MaterialSymbol name="sync" className="text-[16px]" />
              Live Synchronized
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col justify-between gap-4 pb-2 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#dce9ff] shadow-sm">
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#002546]">
                    {displayName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase() || "ST"}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#153a75] shadow-sm" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-[#002546]">{displayName}</span>
                    <MaterialSymbol name="verified" className="text-[18px] text-[#153a75]" />
                  </div>
                  <span className="text-xs text-[#42474f]">
                    {locationBits || "Engineering Student"}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-[#002546]">
                    {college}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start overflow-x-auto rounded-xl bg-[#eff4ff] p-1.5 lg:self-auto">
                {(
                  [
                    ["industry", "badge", "Industry Profile"],
                    ["projects", "folder", "Projects"],
                    ["skills", "psychology", "Skills"],
                    ["feedback", "reviews", "Feedback"],
                  ] as const
                ).map(([id, icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={
                      tab === id
                        ? "inline-flex items-center gap-1 rounded-lg bg-[#002546] px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                        : "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[#42474f] transition-all hover:text-[#0b1c30]"
                    }
                  >
                    <MaterialSymbol name={icon} className="text-[16px]" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "industry" || tab === "projects" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:col-span-8">
                  <MetricCard
                    label="READY Score"
                    value="82"
                    delta="+14"
                    icon="analytics"
                    footer={
                      <svg
                        className="h-8 w-full text-[#002546]"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        viewBox="0 0 80 24"
                      >
                        <path d="M2 20 L 16 16 L 32 18 L 48 10 L 64 12 L 78 4" />
                      </svg>
                    }
                  />
                  <MetricCard
                    label="Verified Projects"
                    value="1"
                    icon="domain_verification"
                    iconClass="text-[#153a75]"
                    footer={
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#153a75]">
                        <svg className="h-4 w-5 fill-current" viewBox="0 0 24 16">
                          <rect height="6" opacity="0.4" rx="1" width="4" x="2" y="10" />
                          <rect height="10" opacity="0.7" rx="1" width="4" x="9" y="6" />
                          <rect height="14" rx="1" width="4" x="16" y="2" />
                        </svg>
                        Stage 2
                      </div>
                    }
                  />
                  <MetricCard
                    label="Industry Skills"
                    value="4"
                    icon="military_tech"
                    className="col-span-2 sm:col-span-1"
                    footer={
                      <div className="flex flex-col gap-0.5 text-[11px] font-medium leading-tight text-[#42474f]">
                        {INDUSTRY_SKILLS.map((skill) => (
                          <span key={skill} className="truncate">
                            • {skill}
                          </span>
                        ))}
                      </div>
                    }
                  />
                  <MetricCard
                    label="Industry Feedback"
                    value="1"
                    icon="rate_review"
                    iconClass="text-[#002e97]"
                    footer={
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#002e97]">
                        <MaterialSymbol name="thumb_up" className="text-[18px]" />
                        Positive
                      </div>
                    }
                  />
                  <MetricCard
                    label="Paid Continuations"
                    value="1"
                    icon="stars"
                    iconClass="text-[#eab308]"
                    footer={
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ca8a04]">
                        <MaterialSymbol name="celebration" className="text-[16px]" />
                        Offered
                      </div>
                    }
                  />
                </div>

                <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#002e97] p-5 text-white shadow-md lg:col-span-4">
                  <div className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-[#001c66] opacity-30" />
                  <div className="relative z-10 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#b8d4ff]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#b7c4ff]">
                        Milestone Unlocked
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight">Next Opportunity</h3>
                    <p className="pt-1 text-sm leading-relaxed text-[#b7c4ff]">
                      You are now eligible to apply for paid industry projects.
                    </p>
                  </div>
                  <div className="relative z-10 pt-6">
                    <Link
                      href={ROUTES.projects}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#002e97] shadow-sm transition-all hover:bg-[#eff4ff] active:scale-95"
                    >
                      Explore Stage 3 →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "skills" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INDUSTRY_SKILLS.map((skill) => (
                  <div
                    key={skill}
                    className="rounded-xl bg-[#eff4ff] p-4 text-center shadow-sm"
                  >
                    <MaterialSymbol
                      name="military_tech"
                      className="mx-auto text-[28px] text-[#153a75]"
                    />
                    <p className="mt-2 text-sm font-semibold text-[#002546]">{skill}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "feedback" ? (
              <div className="rounded-xl bg-[#eff4ff] p-4 shadow-sm">
                <p className="text-sm italic text-[#0b1c30]">
                  “Great work! The team demonstrated strong learning and measurable improvement
                  between the two iterations.”
                </p>
                <p className="mt-2 text-xs font-semibold text-[#002546]">
                  — Industry Mentor, {detail.company}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-[#eff4ff] p-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#153a75] text-white">
                  <MaterialSymbol name="shield" className="text-[20px]" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#002546]">
                    ImReady Verified Identity Certificate #{certId}
                  </span>
                  <p className="text-xs text-[#42474f]">
                    Validated through 2 iterative sprint cycles with {detail.company} leadership
                    review.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 self-stretch md:self-auto">
                <button
                  type="button"
                  onClick={() => showToast("Share profile coming soon")}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1c30] shadow-sm transition-colors hover:bg-[#dce9ff]"
                >
                  <MaterialSymbol name="share" className="text-[16px]" />
                  Share Profile
                </button>
                <button
                  type="button"
                  onClick={() => showToast("PDF export coming soon")}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#002546] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0d3b66]"
                >
                  <MaterialSymbol name="download" className="text-[16px]" />
                  Export PDF Resume
                </button>
              </div>
            </div>
          </div>
        </section>
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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-[#eff4ff] px-2 py-0.5 text-[11px] font-semibold text-[#42474f]">
      {label}: <strong>{value}</strong>
    </span>
  );
}

function MetricCard({
  label,
  value,
  delta,
  icon,
  iconClass,
  footer,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: string;
  iconClass?: string;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-xl bg-[#eff4ff] p-3 shadow-sm transition-shadow hover:shadow-md ${className || ""}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-[#42474f]">{label}</span>
        <MaterialSymbol
          name={icon}
          className={`text-[18px] ${iconClass || "text-[#002546]"}`}
        />
      </div>
      <div className="my-1 flex items-baseline gap-1">
        <span className="text-[32px] font-bold leading-10 tracking-tight text-[#002546]">
          {value}
        </span>
        {delta ? (
          <span className="text-[11px] font-semibold text-[#153a75]">{delta}</span>
        ) : null}
      </div>
      {footer}
    </div>
  );
}

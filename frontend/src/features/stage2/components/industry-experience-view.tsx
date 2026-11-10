"use client";

import Image from "next/image";
import Link from "next/link";
import {
  STAGE2_HERO_IMAGE,
  STAGE2_VALUE_PILLARS,
} from "@/constants/stage2-industry-experience";
import { ROUTES } from "@/constants/routes";
import { Stage2ProjectCard } from "@/features/stage2/components/stage2-project-card";
import { MaterialSymbol } from "@/features/stage2/components/material-symbol";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import {
  FOUNDATION_VERIFICATION_FAILED_MESSAGE,
  FOUNDATION_VERIFICATION_PENDING_MESSAGE,
} from "@/constants/project-access";
import { useUnpaidProjects } from "@/features/stage2/hooks/use-unpaid-projects";

const CATALOGUE_SECTION_ID = "exploreCatalogueSection";
const PEEK_LIMIT = 3;

function scrollToCatalogue() {
  document
    .getElementById(CATALOGUE_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Stage 2 celebration + value prop + unpaid projects peek (HTML mock main, no header/footer). */
export function IndustryExperienceView() {
  const { unpaidProjectsUnlocked, foundationVerificationStatus } = useStudentProfile();
  const {
    activeFilter,
    setActiveFilter,
    projects,
    filtered,
    filterPills,
    loading,
    error,
  } = useUnpaidProjects();

  const peekProjects = filtered.slice(0, PEEK_LIMIT);
  const verificationBanner =
    foundationVerificationStatus === "PENDING"
      ? FOUNDATION_VERIFICATION_PENDING_MESSAGE
      : foundationVerificationStatus === "FAILED"
        ? FOUNDATION_VERIFICATION_FAILED_MESSAGE
        : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Editorial Stage Banner */}
      <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:gap-6 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#b8d4ff]/30 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#153a75] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b8d4ff]" />
              Board A: Student Discovery
            </span>
            <span className="text-xs font-medium text-[#42474f]">
              Stage 2 Roadmap Transition
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#002546] lg:text-[24px] lg:leading-8">
            Stage 2 – Industry Experience
          </h1>
          <p className="max-w-xl text-sm leading-5 text-[#42474f]">
            From Foundation completion to joining a verified real-world project team.
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-start gap-3 sm:flex-row lg:flex-col lg:items-end">
          <div className="max-w-md rounded-lg bg-[#dce9ff]/60 px-3 py-1 text-left shadow-sm lg:text-right">
            <p className="text-xs font-medium italic text-[#002546]">
              &ldquo;You don&apos;t just learn. You do. And that changes you.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-[#eff4ff] px-3 py-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#153a75] text-[12px] font-bold text-white">
                ✓
              </span>
              <span className="text-[11px] font-semibold text-[#0b1c30]">Foundation</span>
            </div>
            <span className="h-0.5 w-6 rounded-full bg-[#153a75]" />
            <div className="flex items-center gap-1.5 rounded-full bg-[#002546] px-2 py-0.5 text-white shadow-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d3e4ff] text-[10px] font-bold text-[#001c38]">
                2
              </span>
              <span className="text-[11px] font-semibold tracking-wide">Industry Exp</span>
            </div>
            <span className="h-0.5 w-6 rounded-full bg-[#c3c6d0]/60" />
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#d3e4fe] text-[10px] font-bold text-[#42474f]">
                3
              </span>
              <span className="text-[11px] text-[#42474f]">Paid Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual bento: celebration + value architecture */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm lg:col-span-5 lg:p-8">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#153a75]" />
          <div className="pointer-events-none absolute -left-12 bottom-12 h-48 w-48 rounded-full bg-[#dce9ff]/40 blur-2xl" />
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#153a75]">
                <MaterialSymbol name="verified" className="text-[18px]" />
                <span>Milestone Achieved</span>
              </div>
              <span className="rounded-full bg-[#b8d4ff]/50 px-2 py-0.5 text-[11px] font-bold text-[#001c38]">
                Level 2 Access
              </span>
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-xl bg-gradient-to-b from-[#eff4ff] via-[#e5eeff] to-[#dce9ff] shadow-inner">
              <Image
                src={STAGE2_HERO_IMAGE}
                alt="Student achievement illustration for Stage 2 readiness"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <div className="inline-flex items-center gap-1 text-lg font-semibold text-[#002546]">
                <span>Congratulations!</span>
                <MaterialSymbol name="stars" className="text-[22px] text-[#153a75]" filled />
              </div>
              <h2 className="text-2xl font-bold leading-snug tracking-tight text-[#002546]">
                You&apos;ve completed Foundation
              </h2>
              <p className="text-sm leading-5 text-[#42474f]">
                You now know how to use the{" "}
                <span className="font-semibold text-[#002546]">READY</span> way of working. Now
                it&apos;s time to apply it on real industry problems and build demonstrable track
                records.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-8">
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#153a75] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#102b55] active:scale-[0.99]"
            >
              <span>Start Stage 2</span>
              <MaterialSymbol name="arrow_forward" className="text-[20px]" />
            </button>
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#737780]">
              <MaterialSymbol name="lock_open" className="text-[16px]" />
              <span>Self-directed project matching enabled</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between gap-6 rounded-xl bg-white p-6 shadow-sm lg:col-span-7 lg:p-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#b8d4ff]/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#001c38]">
                Free For Students
              </span>
              <span className="text-xs font-medium text-[#42474f]">
                • Live Academic Credit Compatible
              </span>
            </div>
            <h2 className="text-[26px] font-bold leading-[34px] tracking-tight text-[#002546] lg:text-[32px] lg:leading-10">
              Stage 2 Industry Experience
            </h2>
            <p className="text-lg font-semibold leading-[26px] text-[#153a75]">
              Real Projects. Real Proof. Real Opportunities.
            </p>
            <p className="max-w-2xl text-sm leading-5 text-[#42474f]">
              Transition from simulated sandbox tutorials to actual venture sprints. Collaborate in
              agile teams of 2–5 students to build portfolio-grade deliverables directly with
              founders.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STAGE2_VALUE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="group flex flex-col gap-2 rounded-xl bg-[#eff4ff]/70 p-4 transition-all hover:bg-[#dce9ff]/50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${pillar.iconClassName}`}
                >
                  <MaterialSymbol name={pillar.icon} className="text-[24px]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold text-[#0b1c30] transition-colors group-hover:text-[#002546]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs leading-4 text-[#42474f]">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-[#002546] p-4 text-white shadow-md sm:flex-row sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0d3b66] text-[#81a6d7]">
                <MaterialSymbol name="rocket_launch" className="text-[26px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#d3e4ff]">
                  Work on real projects. Build your profile.
                </span>
                <span className="text-xs text-white/80">
                  Learn with genuine purpose alongside peers.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={scrollToCatalogue}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#153a75] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#102b55]"
            >
              <span>Explore Projects</span>
              <MaterialSymbol name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {verificationBanner ? (
        <div className="rounded-xl border border-[#d3e4ff] bg-[#eff4ff] px-4 py-3 text-sm text-[#153a75] shadow-sm">
          {verificationBanner}
        </div>
      ) : null}

      {/* Live project inventory peek */}
      <div className="flex w-full flex-col gap-6 pt-2" id={CATALOGUE_SECTION_ID}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
              <MaterialSymbol name="hub" className="text-[16px]" />
              <span>Live Project Inventory</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#002546]">
              Find a project that excites you
            </h2>
            <p className="text-sm leading-5 text-[#42474f]">
              {loading
                ? "Loading active partner challenges…"
                : `Explore active partner challenges currently forming student teams (${projects.length} project${projects.length === 1 ? "" : "s"} live).`}
            </p>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {filterPills.map((pill) => {
              const isActive = activeFilter === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setActiveFilter(pill)}
                  className={
                    isActive
                      ? "flex shrink-0 items-center gap-1 rounded-full bg-[#002546] px-3 py-1 text-[11px] font-semibold text-white"
                      : "shrink-0 rounded-full bg-[#e5eeff] px-3 py-1 text-[11px] text-[#42474f] transition-colors hover:text-[#0b1c30]"
                  }
                >
                  {isActive ? <span>✓</span> : null} {pill}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="rounded-xl bg-white p-4 text-sm text-red-600 shadow-sm">{error}</p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-white shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {peekProjects.map((project) => (
              <Stage2ProjectCard
                key={project.id}
                project={project}
                detailsLocked={!unpaidProjectsUnlocked}
              />
            ))}
          </div>
        )}

        {!loading && !error && peekProjects.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-sm text-[#42474f] shadow-sm">
            No unpaid projects match this filter yet. Check back soon.
          </p>
        ) : null}

        <div className="mt-2 flex flex-col items-center justify-between gap-4 rounded-xl bg-[#dce9ff]/60 p-4 sm:flex-row sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b8d4ff] text-[#001c38]">
              <MaterialSymbol name="tune" className="text-[20px]" />
            </div>
            <p className="text-sm text-[#0b1c30]">
              Looking for something specific? Apply filters for{" "}
              <span className="font-semibold text-[#002546]">team duration</span>,{" "}
              <span className="font-semibold text-[#002546]">industry domain</span>, or{" "}
              <span className="font-semibold text-[#002546]">skill matches</span>.
            </p>
          </div>
          <Link
            href={ROUTES.freeProjects}
            className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-[#002546] shadow-sm transition-all hover:bg-[#002546] hover:text-white"
          >
            Open Advanced Filter Rail
          </Link>
        </div>
      </div>
    </div>
  );
}

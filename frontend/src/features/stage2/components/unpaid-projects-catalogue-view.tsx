"use client";

import { useMemo } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { Button } from "@/components/ui/button";
import {
  FOUNDATION_VERIFICATION_FAILED_MESSAGE,
  FOUNDATION_VERIFICATION_PENDING_MESSAGE,
  INDUSTRY_PROJECTS_PREVIEW_BANNER,
} from "@/constants/project-access";
import { ROUTES } from "@/constants/routes";
import {
  Stage2ProjectCard,
  type Stage2ProjectCardAccess,
} from "@/features/stage2/components/stage2-project-card";
import { MaterialSymbol } from "@/features/stage2/components/material-symbol";
import { useUnpaidProjects } from "@/features/stage2/hooks/use-unpaid-projects";

function resolveCardAccess(options: {
  projectId: string;
  featuredProjectId: string | null;
  foundationComplete: boolean;
}): Stage2ProjectCardAccess {
  const { projectId, featuredProjectId, foundationComplete } = options;
  if (foundationComplete) return "open";
  if (featuredProjectId && projectId === featuredProjectId) return "preview";
  return "locked";
}

export function UnpaidProjectsCatalogueView({
  showIntro = true,
}: {
  showIntro?: boolean;
}) {
  const {
    foundationComplete,
    unpaidProjectsUnlocked,
    foundationVerificationStatus,
    loading: sessionLoading,
  } = useStudentProfile();
  const {
    activeFilter,
    setActiveFilter,
    projects,
    filtered,
    filterPills,
    loading,
    error,
  } = useUnpaidProjects();

  const featuredProjectId = useMemo(
    () => projects[0]?.id ?? null,
    [projects],
  );

  const verificationBanner =
    foundationVerificationStatus === "PENDING"
      ? FOUNDATION_VERIFICATION_PENDING_MESSAGE
      : foundationVerificationStatus === "FAILED"
        ? FOUNDATION_VERIFICATION_FAILED_MESSAGE
        : null;

  const previewBanner =
    !sessionLoading && !foundationComplete ? INDUSTRY_PROJECTS_PREVIEW_BANNER : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {showIntro ? (
        <div className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#153a75]">
            <MaterialSymbol name="hub" className="text-[16px]" />
            Live Project Inventory
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#002546]">
            Industry Projects
          </h1>
          <p className="text-sm leading-5 text-[#42474f]">
            Explore verified industry challenges and join a student team.
          </p>
        </div>
      ) : null}

      {previewBanner ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#d3e4ff] bg-[#eff4ff] px-4 py-3 text-sm text-[#153a75] shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p>{previewBanner}</p>
          <Button href={ROUTES.assessment} className="shrink-0">
            Continue Foundation
          </Button>
        </div>
      ) : null}

      {verificationBanner ? (
        <div className="rounded-xl border border-[#d3e4ff] bg-[#eff4ff] px-4 py-3 text-sm text-[#153a75] shadow-sm">
          {verificationBanner}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-6" id="exploreCatalogueSection">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#002546]">
              Find a project that excites you
            </h2>
            <p className="text-sm leading-5 text-[#42474f]">
              {loading
                ? "Loading active partner challenges…"
                : foundationComplete
                  ? `${filtered.length} project${filtered.length === 1 ? "" : "s"} available`
                  : "Featured preview available · remaining projects unlock after Foundation"}
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
          <p className="rounded-xl bg-white p-6 text-sm text-red-600 shadow-sm">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Stage2ProjectCard
              key={project.id}
              project={project}
              access={resolveCardAccess({
                projectId: project.id,
                featuredProjectId,
                foundationComplete,
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import {
  FOUNDATION_APPLY_LOCKED_MESSAGE,
  FOUNDATION_VERIFICATION_DETAIL_LOCKED_MESSAGE,
  FOUNDATION_VERIFICATION_FAILED_MESSAGE,
  FOUNDATION_VERIFICATION_PENDING_MESSAGE,
  UNPAID_PROJECTS_LOCKED_MESSAGE,
} from "@/constants/project-access";
import { Stage2ProjectDetailView } from "@/features/stage2/components/stage2-project-detail-view";
import { mapApiProjectToStage2Detail } from "@/features/stage2/lib/map-api-project";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { ApiError, projectsApi } from "@/lib/api";

export function Stage2ProjectDetailLoader({ projectId }: { projectId: string }) {
  const {
    foundationComplete,
    unpaidProjectsUnlocked,
    foundationVerificationStatus,
    loading: sessionLoading,
  } = useStudentProfile();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredAllowed, setFeaturedAllowed] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Before Foundation, only the featured (first catalogue) project is a readable preview.
        if (!foundationComplete) {
          const list = await projectsApi.list(undefined, "free");
          const featuredId = list.projects[0]?.id || list.projects[0]?.dbId || null;
          const isFeatured =
            featuredId != null &&
            (String(featuredId) === String(projectId) ||
              list.projects[0]?.id === projectId);
          if (!isFeatured) {
            if (!cancelled) {
              setFeaturedAllowed(false);
              setDetail(null);
              setError(UNPAID_PROJECTS_LOCKED_MESSAGE);
              setLoading(false);
            }
            return;
          }
          if (!cancelled) setFeaturedAllowed(true);
        } else if (!cancelled) {
          setFeaturedAllowed(false);
        }

        const [project, categoriesResult] = await Promise.all([
          projectsApi.getBySlug(projectId, "free"),
          projectsApi.listCategories().catch(() => ({ categories: [] })),
        ]);
        if (cancelled) return;
        const categoryNameBySlug = Object.fromEntries(
          (categoriesResult.categories || []).map((c) => [c.slug, c.name]),
        );
        setDetail(mapApiProjectToStage2Detail(project, categoryNameBySlug));
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === "FOUNDATION_VERIFICATION_REQUIRED") {
          setError(err.message || FOUNDATION_VERIFICATION_DETAIL_LOCKED_MESSAGE);
        } else if (err instanceof ApiError && err.code === "FOUNDATION_INCOMPLETE") {
          setError(err.message || UNPAID_PROJECTS_LOCKED_MESSAGE);
        } else {
          setError(err instanceof Error ? err.message : "Project not found");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId, foundationComplete, foundationVerificationStatus, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse space-y-4">
        <div className="h-40 rounded-xl bg-white shadow-sm" />
        <div className="h-64 rounded-xl bg-white shadow-sm" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">
          {foundationComplete ? "Project not found" : "Project locked"}
        </h1>
        <p className="text-sm text-[#42474f]">
          {error || UNPAID_PROJECTS_LOCKED_MESSAGE}
        </p>
        {!foundationComplete ? (
          <Link
            href={ROUTES.assessment}
            className="text-sm font-semibold text-[#153a75] hover:underline"
          >
            Continue Foundation →
          </Link>
        ) : null}
        <Link href={ROUTES.freeProjects} className="text-sm font-semibold text-[#153a75] hover:underline">
          ← Back to Industry Projects
        </Link>
      </div>
    );
  }

  const applyLockedReason = !foundationComplete
    ? FOUNDATION_APPLY_LOCKED_MESSAGE
    : !unpaidProjectsUnlocked
      ? foundationVerificationStatus === "PENDING"
        ? FOUNDATION_VERIFICATION_PENDING_MESSAGE
        : foundationVerificationStatus === "FAILED"
          ? FOUNDATION_VERIFICATION_FAILED_MESSAGE
          : FOUNDATION_APPLY_LOCKED_MESSAGE
      : null;

  return (
    <Stage2ProjectDetailView
      detail={detail}
      applyLocked={!unpaidProjectsUnlocked}
      applyLockedReason={applyLockedReason}
      isPreview={!foundationComplete && featuredAllowed}
    />
  );
}

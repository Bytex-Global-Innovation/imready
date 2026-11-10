"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import {
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
    unpaidProjectsUnlocked,
    foundationVerificationStatus,
    loading: sessionLoading,
  } = useStudentProfile();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!unpaidProjectsUnlocked) {
      setLoading(false);
      setDetail(null);
      setError(
        foundationVerificationStatus === "PENDING"
          ? FOUNDATION_VERIFICATION_PENDING_MESSAGE
          : foundationVerificationStatus === "FAILED"
            ? FOUNDATION_VERIFICATION_FAILED_MESSAGE
            : UNPAID_PROJECTS_LOCKED_MESSAGE,
      );
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
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
  }, [projectId, unpaidProjectsUnlocked, foundationVerificationStatus, sessionLoading]);

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
          {unpaidProjectsUnlocked ? "Project not found" : "Details locked"}
        </h1>
        <p className="text-sm text-[#42474f]">
          {error || FOUNDATION_VERIFICATION_DETAIL_LOCKED_MESSAGE}
        </p>
        <Link href={ROUTES.freeProjects} className="text-sm font-semibold text-[#153a75] hover:underline">
          ← Back to Unpaid Projects
        </Link>
      </div>
    );
  }

  return <Stage2ProjectDetailView detail={detail} />;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import {
  FOUNDATION_APPLY_LOCKED_MESSAGE,
  FOUNDATION_VERIFICATION_FAILED_MESSAGE,
  FOUNDATION_VERIFICATION_PENDING_MESSAGE,
} from "@/constants/project-access";
import { Stage2ProjectApplyView } from "@/features/stage2/components/stage2-project-apply-view";
import { mapApiProjectToStage2Detail } from "@/features/stage2/lib/map-api-project";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { projectsApi } from "@/lib/api";

export function Stage2ProjectApplyLoader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const {
    foundationComplete,
    unpaidProjectsUnlocked,
    foundationVerificationStatus,
    loading: sessionLoading,
  } = useStudentProfile();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    if (!foundationComplete || !unpaidProjectsUnlocked) {
      setLoading(false);
      setDetail(null);
      setError(
        !foundationComplete
          ? FOUNDATION_APPLY_LOCKED_MESSAGE
          : foundationVerificationStatus === "PENDING"
            ? FOUNDATION_VERIFICATION_PENDING_MESSAGE
            : foundationVerificationStatus === "FAILED"
              ? FOUNDATION_VERIFICATION_FAILED_MESSAGE
              : FOUNDATION_APPLY_LOCKED_MESSAGE,
      );
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const [project, status, categoriesResult] = await Promise.all([
          projectsApi.getBySlug(projectId, "free"),
          projectsApi.getMyStatus(projectId).catch(() => null),
          projectsApi.listCategories().catch(() => ({ categories: [] })),
        ]);
        if (cancelled) return;

        if (status?.hasApplied) {
          router.replace(ROUTES.stage2ProjectTeam(projectId));
          return;
        }

        const categoryNameBySlug = Object.fromEntries(
          (categoriesResult.categories || []).map((c) => [c.slug, c.name]),
        );
        setDetail(
          mapApiProjectToStage2Detail(
            {
              ...project,
              viewer: status || project.viewer,
            },
            categoryNameBySlug,
          ),
        );
      } catch (err) {
        if (!cancelled) {
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
  }, [
    projectId,
    router,
    sessionLoading,
    foundationComplete,
    unpaidProjectsUnlocked,
    foundationVerificationStatus,
  ]);

  if (sessionLoading || loading) {
    return <div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-xl bg-white shadow-sm" />;
  }
  if (error || !detail) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">Apply locked</h1>
        <p className="text-sm text-[#42474f]">{error || FOUNDATION_APPLY_LOCKED_MESSAGE}</p>
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
  return <Stage2ProjectApplyView detail={detail} />;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stage2TeamFormationView } from "@/features/stage2/components/stage2-team-formation-view";
import { mapApiProjectToStage2Detail } from "@/features/stage2/lib/map-api-project";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { ApiError, projectsApi } from "@/lib/api";

export function Stage2TeamFormationLoader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [project, status, categoriesResult] = await Promise.all([
          projectsApi.getBySlug(projectId, "free"),
          projectsApi.getMyStatus(projectId),
          projectsApi.listCategories().catch(() => ({ categories: [] })),
        ]);
        if (cancelled) return;

        if (!status.hasApplied) {
          router.replace(ROUTES.stage2ProjectApply(projectId));
          return;
        }

        const categoryNameBySlug = Object.fromEntries(
          (categoriesResult.categories || []).map((c) => [c.slug, c.name]),
        );
        setDetail(
          mapApiProjectToStage2Detail(
            { ...project, viewer: status },
            categoryNameBySlug,
          ),
        );
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.code === "APPLICATION_REQUIRED") {
            router.replace(ROUTES.stage2ProjectApply(projectId));
            return;
          }
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
  }, [projectId, router]);

  if (loading) {
    return <div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-xl bg-white shadow-sm" />;
  }
  if (error || !detail) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">Unable to open team workspace</h1>
        <p className="text-sm text-[#42474f]">{error}</p>
        <Link href={ROUTES.freeProjects} className="text-sm font-semibold text-[#153a75] hover:underline">
          ← Back to Industry Projects
        </Link>
      </div>
    );
  }
  return <Stage2TeamFormationView detail={detail} />;
}

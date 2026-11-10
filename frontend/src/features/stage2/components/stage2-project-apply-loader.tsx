"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Stage2ProjectApplyView } from "@/features/stage2/components/stage2-project-apply-view";
import { mapApiProjectToStage2Detail } from "@/features/stage2/lib/map-api-project";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import { projectsApi } from "@/lib/api";

export function Stage2ProjectApplyLoader({ projectId }: { projectId: string }) {
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
  }, [projectId]);

  if (loading) {
    return <div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-xl bg-white shadow-sm" />;
  }
  if (error || !detail) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">Project not found</h1>
        <p className="text-sm text-[#42474f]">{error}</p>
        <Link href={ROUTES.freeProjects} className="text-sm font-semibold text-[#153a75] hover:underline">
          ← Back to Unpaid Projects
        </Link>
      </div>
    );
  }
  return <Stage2ProjectApplyView detail={detail} />;
}

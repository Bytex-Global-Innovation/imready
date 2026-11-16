"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stage2ProjectOutcomeView } from "@/features/stage2/components/stage2-project-outcome-view";
import { loadStage2Workspace } from "@/features/stage2/lib/load-stage2-workspace";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import {
  projectsApi,
  type ProjectTeam,
  type Stage2Outcome,
} from "@/lib/api";

export function Stage2ProjectOutcomeLoader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [team, setTeam] = useState<ProjectTeam | null>(null);
  const [outcome, setOutcome] = useState<Stage2Outcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await loadStage2Workspace(projectId);
        if (cancelled) return;
        if (!result.ok) {
          router.replace(
            result.redirectTo === "apply"
              ? ROUTES.stage2ProjectApply(projectId)
              : ROUTES.stage2ProjectTeam(projectId),
          );
          return;
        }
        setDetail(result.data.detail);
        setTeam(result.data.team);

        if (!result.data.preview) {
          try {
            const response = await projectsApi.getStageOutcome(projectId);
            if (!cancelled) setOutcome(response.outcome);
          } catch {
            if (!cancelled) setOutcome(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to open outcome");
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
    return (
      <div className="mx-auto h-96 w-full max-w-7xl animate-pulse rounded-xl bg-white shadow-sm" />
    );
  }
  if (error || !detail || !team) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#002546]">Unable to open outcome</h1>
        <p className="text-sm text-[#42474f]">{error || "Create your team first."}</p>
        <Link
          href={ROUTES.stage2ProjectOwnerFeedback(projectId)}
          className="text-sm font-semibold text-[#153a75] hover:underline"
        >
          ← Back to owner feedback
        </Link>
      </div>
    );
  }

  return <Stage2ProjectOutcomeView detail={detail} team={team} outcome={outcome} />;
}

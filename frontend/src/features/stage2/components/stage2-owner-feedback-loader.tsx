"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stage2OwnerFeedbackView } from "@/features/stage2/components/stage2-owner-feedback-view";
import { loadStage2Workspace } from "@/features/stage2/lib/load-stage2-workspace";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ROUTES } from "@/constants/routes";
import {
  projectsApi,
  type ProjectTeam,
  type Stage2OwnerFeedback,
  type Stage2Outcome,
} from "@/lib/api";

export function Stage2OwnerFeedbackLoader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Stage2ProjectDetail | null>(null);
  const [team, setTeam] = useState<ProjectTeam | null>(null);
  const [feedback, setFeedback] = useState<Stage2OwnerFeedback | null>(null);
  const [outcome, setOutcome] = useState<Stage2Outcome | null>(null);
  const [preview, setPreview] = useState(false);
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
        setPreview(Boolean(result.data.preview));

        if (!result.data.preview) {
          try {
            const fb = await projectsApi.getOwnerFeedback(projectId);
            if (!cancelled) {
              setFeedback(fb.ownerFeedback);
              setOutcome(fb.outcome);
            }
          } catch {
            if (!cancelled) {
              setFeedback(null);
              setOutcome(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to open owner feedback",
          );
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
        <h1 className="text-xl font-bold text-[#002546]">Unable to open feedback</h1>
        <p className="text-sm text-[#42474f]">{error || "Create your team first."}</p>
        <Link
          href={ROUTES.stage2ProjectReview(projectId)}
          className="text-sm font-semibold text-[#153a75] hover:underline"
        >
          ← Back to review
        </Link>
      </div>
    );
  }

  return (
    <Stage2OwnerFeedbackView
      detail={detail}
      team={team}
      feedback={feedback}
      outcome={outcome}
      preview={preview}
    />
  );
}

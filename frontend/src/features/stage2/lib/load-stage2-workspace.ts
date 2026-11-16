import { mapApiProjectToStage2Detail } from "@/features/stage2/lib/map-api-project";
import {
  STAGE2_UI_PREVIEW_ENABLED,
  buildStage2PreviewBundle,
} from "@/features/stage2/lib/stage2-preview-bundle";
import type { Stage2ProjectDetail } from "@/constants/stage2-project-detail";
import { ApiError, projectsApi, type ProjectTeam } from "@/lib/api";

export type Stage2WorkspaceBundle = {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
  /** True when serving static demo data so UI can be browsed without an ACTIVE team. */
  preview?: boolean;
};

export type Stage2WorkspaceLoadResult =
  | { ok: true; data: Stage2WorkspaceBundle }
  | { ok: false; redirectTo: "apply" | "team"; message?: string };

function previewResult(projectId: string): Stage2WorkspaceLoadResult {
  const data = buildStage2PreviewBundle(projectId);
  return { ok: true, data: { ...data, preview: true } };
}

/** Load project + ACTIVE team for post-onboarding workspace screens. */
export async function loadStage2Workspace(
  projectId: string,
): Promise<Stage2WorkspaceLoadResult> {
  try {
    const [project, status, categoriesResult] = await Promise.all([
      projectsApi.getBySlug(projectId, "free"),
      projectsApi.getMyStatus(projectId),
      projectsApi.listCategories().catch(() => ({ categories: [] })),
    ]);

    if (!status.hasApplied) {
      if (STAGE2_UI_PREVIEW_ENABLED) return previewResult(projectId);
      return { ok: false, redirectTo: "apply" };
    }

    const team = status.team;
    if (!team || team.status !== "ACTIVE") {
      if (STAGE2_UI_PREVIEW_ENABLED) return previewResult(projectId);
      return { ok: false, redirectTo: "team" };
    }

    const categoryNameBySlug = Object.fromEntries(
      (categoriesResult.categories || []).map((c) => [c.slug, c.name]),
    );

    const detail = mapApiProjectToStage2Detail(
      { ...project, viewer: status },
      categoryNameBySlug,
    );

    return { ok: true, data: { detail, team, preview: false } };
  } catch (err) {
    if (STAGE2_UI_PREVIEW_ENABLED) {
      return previewResult(projectId);
    }
    if (err instanceof ApiError && err.code === "APPLICATION_REQUIRED") {
      return { ok: false, redirectTo: "apply" };
    }
    throw err;
  }
}

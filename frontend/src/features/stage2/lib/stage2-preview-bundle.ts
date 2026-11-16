import {
  getStage2ProjectDetail,
  type Stage2ProjectDetail,
} from "@/constants/stage2-project-detail";
import type { ProjectTeam } from "@/lib/api";

/** Temporary UI-preview flag — browse Stage 2 screens without an ACTIVE team. */
export const STAGE2_UI_PREVIEW_ENABLED = true;

const PREVIEW_LEAD_ID = "preview-lead";
const PREVIEW_MEMBER_ID = "preview-member";

export function resolveStage2PreviewDetail(projectId: string): Stage2ProjectDetail {
  const known = getStage2ProjectDetail(projectId);
  if (known) return known;
  const fallback = getStage2ProjectDetail("abc-onboarding");
  if (!fallback) {
    throw new Error("Stage 2 preview detail missing");
  }
  return { ...fallback, id: projectId };
}

export function buildStage2PreviewTeam(detail: Stage2ProjectDetail): ProjectTeam {
  const now = new Date().toISOString();
  return {
    id: `preview-team-${detail.id}`,
    uuid: `preview-team-${detail.id}`,
    projectId: detail.id,
    projectSlug: detail.id,
    projectTitle: detail.title,
    projectCompanyName: detail.company,
    name: "Preview Squad",
    status: "ACTIVE",
    creatorStudentId: PREVIEW_LEAD_ID,
    leadStudentId: PREVIEW_LEAD_ID,
    faculty: [{ name: "Campus Mentor", email: "mentor@imready.test" }],
    members: [
      {
        id: "preview-m1",
        studentId: PREVIEW_LEAD_ID,
        studentName: "Aarav Sharma",
        studentEmail: "aarav.sharma@imready.test",
        collegeName: "VJTI",
        domain: "Product",
        role: "CREATOR",
        status: "ACCEPTED",
        isLead: true,
        isCreator: true,
        createdAt: now,
      },
      {
        id: "preview-m2",
        studentId: PREVIEW_MEMBER_ID,
        studentName: "Arjun Mehta",
        studentEmail: "arjun.mehta@imready.test",
        collegeName: "VJTI",
        domain: "Research",
        role: "MEMBER",
        status: "ACCEPTED",
        isLead: false,
        isCreator: false,
        createdAt: now,
      },
      {
        id: "preview-m3",
        studentId: "preview-member-2",
        studentName: "Priya Nair",
        studentEmail: "priya.nair@imready.test",
        collegeName: "VJTI",
        domain: "Design",
        role: "MEMBER",
        status: "ACCEPTED",
        isLead: false,
        isCreator: false,
        createdAt: now,
      },
    ],
    acceptedCount: 3,
    pendingCount: 0,
    reservedCount: 3,
    teamSizeMin: detail.teamSizeMin,
    teamSizeMax: detail.teamSizeMax,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildStage2PreviewBundle(projectId: string): {
  detail: Stage2ProjectDetail;
  team: ProjectTeam;
} {
  const detail = resolveStage2PreviewDetail(projectId);
  return {
    detail,
    team: buildStage2PreviewTeam(detail),
  };
}

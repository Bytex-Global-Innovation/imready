import {
  type Stage2ProjectDetail,
} from "@/constants/stage2-project-detail";
import { resolveMediaUrl, type ApiProjectItem } from "@/lib/api";

export type Stage2ProjectCardModel = {
  id: string;
  badge: { label: string; className: string };
  image: string;
  imageAlt: string;
  company: string;
  duration: string;
  title: string;
  description: string;
  tags: string[];
  teamSize: string;
  teamSizeMin: number;
  teamSizeMax: number;
  category: string;
  remainingDays?: number | null;
  applicationsOpen?: boolean;
  applicationsClosed?: boolean;
};

function badgeClassFor(label: string): string {
  const key = label.trim().toLowerCase();
  if (key.includes("ai") || key.includes("data")) return "bg-[#153a75] text-white";
  if (key.includes("sustain")) return "bg-[#0d3b66] text-[#81a6d7]";
  if (key.includes("featured")) return "bg-[#002546]/90 text-white";
  return "bg-[#002546]/90 text-white";
}

function humanizeSlug(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const DEFAULT_GAINS = [
  "Work on a real product problem",
  "Build industry-relevant skills",
  "Get verified proof of work",
  "Potential opportunity for paid continuation (Stage 3)",
] as const;

export function mapApiProjectToStage2Card(
  project: ApiProjectItem,
  categoryNameBySlug?: Record<string, string>,
): Stage2ProjectCardModel {
  const categoryLabel =
    (project.category && categoryNameBySlug?.[project.category]) ||
    (project.category ? humanizeSlug(project.category) : "Project");
  const badgeLabel = project.badge?.trim() || categoryLabel;
  const tags =
    project.tags?.length
      ? project.tags
      : project.requirements?.length
        ? project.requirements
        : (project.techStack || []).map((t) => t.label).filter(Boolean);

  return {
    id: project.id,
    badge: { label: badgeLabel, className: badgeClassFor(badgeLabel) },
    image:
      resolveMediaUrl(project.imageSrc) || "/images/projects/placeholder.jpg",
    imageAlt: project.imageAlt || project.title,
    company: project.companyName?.trim() || "Industry Partner",
    duration: project.estimatedTime?.trim() || "Duration TBD",
    title: project.title,
    description: project.description,
    tags: tags.slice(0, 6),
    teamSize: project.teamSizeLabel || `${project.teamSize || 1} students`,
    teamSizeMin: project.teamSizeMin || (Number(project.teamSize) <= 1 ? 1 : 2),
    teamSizeMax: project.teamSizeMax || Number(project.teamSize) || 1,
    category: categoryLabel,
    remainingDays: project.remainingDays ?? null,
    applicationsOpen: project.applicationsOpen !== false,
    applicationsClosed: Boolean(project.applicationsClosed),
  };
}

export function mapApiProjectToStage2Detail(
  project: ApiProjectItem,
  categoryNameBySlug?: Record<string, string>,
): Stage2ProjectDetail {
  const card = mapApiProjectToStage2Card(project, categoryNameBySlug);
  const processSteps =
    (project.briefRequirements || []).filter(Boolean).slice(0, 4).length > 0
      ? (project.briefRequirements || []).filter(Boolean).slice(0, 4)
      : (project.deliverables || []).map((d) => d.label).filter(Boolean).slice(0, 4);

  return {
    id: project.id,
    title: project.title,
    company: card.company,
    duration: card.duration,
    teamSize: card.teamSize,
    teamSizeMin: card.teamSizeMin,
    teamSizeMax: card.teamSizeMax,
    featuredLabel: card.badge.label,
    heroImage: card.image,
    heroImageAlt: card.imageAlt,
    summary: project.description,
    categoryPill: card.category,
    pillTags: card.tags,
    problem: project.overview || project.description,
    targetUser:
      "Students ready for Stage 2 industry experience who want verified proof of work with a real partner.",
    whyMatters:
      "Working on a verified unpaid industry project builds portfolio evidence and prepares you for paid Stage 3 placements.",
    whatYouDo:
      "Collaborate with your team to research, design, and validate a solution with mentor guidance.",
    processSteps:
      processSteps.length > 0
        ? processSteps
        : [
            "Discovery interviews",
            "Synthesis and journey mapping",
            "Prototype or concept design",
            "Validation with users",
          ],
    expectedOutcome:
      (project.deliverables || []).map((d) => d.label).filter(Boolean).join(" · ") ||
      "Documented deliverables and recommendations ready for partner review.",
    companyBlurb: `${card.company} · Verified Industry Partner`,
    motivationDefault:
      "I'm interested in this challenge and want to contribute through research, product thinking, and teamwork.",
    whatYouGain:
      project.whatYouGain?.length ? project.whatYouGain : [...DEFAULT_GAINS],
    cohortStarts: project.cohortStarts?.trim() || "To be announced",
    mentorshipLabel: project.mentorshipLabel?.trim() || "Verified Industry Partner",
    teamFormationNote:
      project.teamFormationNote?.trim() ||
      "Submit your interest to form or join an active team.",
    applyOpensAt: project.applyOpensAt ?? null,
    applyClosesAt: project.applyClosesAt ?? null,
    remainingDays: project.remainingDays ?? null,
    applicationsOpen: project.applicationsOpen !== false,
    applicationsClosed: Boolean(project.applicationsClosed),
    applicationsNotYetOpen: Boolean(project.applicationsNotYetOpen),
  };
}

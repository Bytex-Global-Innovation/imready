"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Lock,
  Tag,
} from "@/components/icons";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { Button } from "@/components/ui/button";
import { UNPAID_PROJECTS_LOCKED_MESSAGE } from "@/constants/project-access";
import { Card } from "@/components/ui/card";
import { PROJECTS, type ProjectItem } from "@/constants/projects";
import { ROUTES } from "@/constants/routes";
import { projectsApi, resolveMediaUrl, type ApiProjectItem } from "@/lib/api";
import { formatInrAmount } from "@/lib/format-currency";
import { ApplySuccessModal } from "./apply-success-modal";

function BriefPill({
  icon: Icon,
  label,
}: {
  icon: typeof BarChart2;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </span>
  );
}

function SectionCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
        {number}. {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function mapApiProject(project: ApiProjectItem): ProjectItem {
  return {
    id: project.id,
    category: project.category,
    badge: project.badge,
    title: project.title,
    description: project.description,
    imageSrc: resolveMediaUrl(project.imageSrc),
    imageAlt: project.imageAlt,
    requirements: project.requirements || [],
    techStack: [],
    estimatedTime: project.estimatedTime,
    level: project.level,
    overview: project.overview,
    briefRequirements: project.briefRequirements,
    deliverables: project.deliverables,
    evaluationCriteria: project.evaluationCriteria,
    resources: (project.resources || []).map((resource) => ({
      ...resource,
      href: resolveMediaUrl(resource.href) || resource.href,
    })),
    projectPriceAmount: project.projectPriceAmount ?? null,
  };
}

export function ProjectBriefView({
  projectId,
  access = "premium",
}: {
  projectId: string;
  access?: "free" | "premium";
}) {
  const [project, setProject] = useState<ProjectItem | null>(
    PROJECTS.find((item) => item.id === projectId) || null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const { unpaidProjectsUnlocked, paidProjectsUnlocked } = useStudentProfile();
  const canApply =
    access === "free" ? unpaidProjectsUnlocked : paidProjectsUnlocked;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await projectsApi.getBySlug(projectId, access);
        if (!cancelled) setProject(mapApiProject(data));
      } catch {
        if (!cancelled) {
          const fallback =
            access === "premium"
              ? PROJECTS.find((item) => item.id === projectId) || null
              : null;
          setProject(fallback);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, access]);

  async function handleApply() {
    if (!project || !canApply) return;
    setIsApplying(true);
    setApplyError(null);
    try {
      await projectsApi.apply(project.id);
      setIsSuccessOpen(true);
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Failed to apply for project.",
      );
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-sm text-muted">
        Loading project brief…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center text-sm text-muted">
        Project not found.
      </div>
    );
  }

  const priceLabel =
    access === "premium" ? formatInrAmount(project.projectPriceAmount) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link
          href={access === "free" ? ROUTES.freeProjects : ROUTES.projects}
          className="cursor-pointer hover:text-foreground"
        >
          {access === "free" ? "Unpaid Projects" : "Projects"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{project.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {project.title} – Industry Projects
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.level ? (
            <BriefPill icon={BarChart2} label={project.level} />
          ) : null}
          <BriefPill icon={Tag} label={project.badge} />
        </div>
        {priceLabel ? (
          <p className="mt-4 rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">
            This paid project is valued at {priceLabel}.
          </p>
        ) : null}
      </header>

      <div className="space-y-5">
        {project.overview ? (
          <SectionCard number={1} title="Overview">
            <p className="rounded-[var(--radius-card)] border-l-4 border-l-primary bg-surface px-4 py-3 text-sm leading-relaxed text-foreground">
              {project.overview}
            </p>
          </SectionCard>
        ) : null}

        {project.briefRequirements?.length ? (
          <SectionCard number={2} title="Requirements">
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {project.briefRequirements.map((req) => (
                <li key={req} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {project.deliverables?.length ? (
          <SectionCard number={3} title="Deliverables">
            <ul className="space-y-3">
              {project.deliverables.map((deliverable, index) => (
                <li
                  key={deliverable.id}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {deliverable.label}
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {project.evaluationCriteria?.length ? (
          <SectionCard number={4} title="Evaluation Criteria">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {project.evaluationCriteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="rounded-[var(--radius-card)] bg-surface px-4 py-4 text-center"
                >
                  <p className="font-display text-2xl font-bold text-primary">
                    {criterion.percent}%
                  </p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
                    {criterion.label}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>

      {applyError && (
        <p className="mt-4 text-center text-sm text-red-600">{applyError}</p>
      )}

      <div className="mt-6 text-center">
        {canApply ? (
          <Button className="w-full" onClick={handleApply} disabled={isApplying}>
            {isApplying ? "Enrolling…" : "Enroll & Submit Your Solution Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div
            className="w-full rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4"
            role="status"
          >
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="h-4 w-4 text-muted" aria-hidden />
              Project locked
            </p>
            <p className="mt-2 text-sm text-muted">
              {access === "free"
                ? UNPAID_PROJECTS_LOCKED_MESSAGE
                : "Paid industry projects are not available yet."}
            </p>
            {access === "free" ? (
              <Link
                href={ROUTES.assessment}
                className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline"
              >
                Continue Foundation stage
              </Link>
            ) : null}
          </div>
        )}
        {canApply ? (
          <p className="mt-3 text-xs text-muted">
            By starting this project, you agree to our{" "}
            <Link
              href={ROUTES.terms}
              className="cursor-pointer font-medium text-primary underline underline-offset-2 hover:text-primary-hover"
            >
              Submission Terms
            </Link>
            .
          </p>
        ) : null}
      </div>

      <ApplySuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        projectTitle={project.title}
      />
    </div>
  );
}
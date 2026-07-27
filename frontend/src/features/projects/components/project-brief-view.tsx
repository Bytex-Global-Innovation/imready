"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Tag,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PROJECTS } from "@/constants/projects";
import { ROUTES } from "@/constants/routes";
import { ApplySuccessModal } from "./apply-success-modal";

function BriefPill({
  icon: Icon,
  label,
}: {
  icon: typeof Clock;
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

export function ProjectBriefView({ projectId }: { projectId: string }) {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const project = PROJECTS.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link
          href={ROUTES.projects}
          className="cursor-pointer hover:text-foreground"
        >
          Projects
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{project.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {project.title} – Project Brief
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.estimatedTime ? (
            <BriefPill icon={Clock} label={`Estimated time: ${project.estimatedTime}`} />
          ) : null}
          {project.level ? (
            <BriefPill icon={BarChart2} label={project.level} />
          ) : null}
          <BriefPill icon={Tag} label={project.badge} />
        </div>
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

        {project.resources?.length ? (
          <SectionCard number={5} title="Resources">
            <ul className="space-y-2">
              {project.resources.map((resource) => (
                <li key={resource.label}>
                  <a
                    href={resource.href}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-card)] bg-surface px-4 py-3 text-sm font-medium text-foreground hover:bg-brand-100"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-primary" />
                      {resource.label}
                    </span>
                    <Download className="h-4 w-4 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}
      </div>

      <div className="mt-6 text-center">
        <Button className="w-full" onClick={() => setIsSuccessOpen(true)}>
          Apply and Start Project
          <ArrowRight className="h-4 w-4" />
        </Button>
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
      </div>

      <ApplySuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        projectTitle={project.title}
      />
    </div>
  );
}
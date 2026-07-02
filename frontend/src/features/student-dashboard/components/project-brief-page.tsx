"use client";

import Link from "next/link";
import {
  BarChart3,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  Info,
  Library,
  ListChecks,
  Package,
  Rocket,
  Wrench,
} from "lucide-react";
import {
  DASHBOARD_COPY,
  getDashboardProjectById,
  getProjectBriefById,
  type ProjectBrief,
} from "@/constants/student-dashboard";
import { ROUTES } from "@/constants";
import { Button, Card } from "@/components/ui";
import {
  DashboardBreadcrumbs,
  DashboardShell,
} from "./dashboard-shell";

interface ProjectBriefPageProps {
  projectId: string;
}

export function ProjectBriefPage({ projectId }: ProjectBriefPageProps) {
  const project = getDashboardProjectById(projectId);
  const brief = getProjectBriefById(projectId);

  if (!project || !brief) {
    return (
      <DashboardShell activeNav="projects" hideMobileBar>
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-hero-heading">Project not found</h1>
          <p className="mt-2 text-muted">This project brief does not exist.</p>
          <Button href={ROUTES.dashboard} className="mt-6">
            Back to Projects
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const Icon = project.icon;

  return (
    <DashboardShell activeNav="projects" hideMobileBar>
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <DashboardBreadcrumbs
              className="mb-0"
              items={[
                { label: DASHBOARD_COPY.projectsBreadcrumb, href: ROUTES.dashboard },
                { label: project.title },
              ]}
            />

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4" />
                {DASHBOARD_COPY.downloadBrief}
              </Button>
              {project.canApply ? (
                <Button size="sm" className="w-full sm:w-auto">
                  <Rocket className="h-4 w-4" />
                  {DASHBOARD_COPY.startProject}
                </Button>
              ) : null}
            </div>
          </div>

          <Card className="p-5 sm:p-6 lg:p-8">
            <BriefHeader brief={brief} icon={Icon} />
            <BriefSection
              title={DASHBOARD_COPY.overview}
              icon={Info}
              className="mt-6"
            >
              <p className="text-sm leading-relaxed text-muted sm:text-base">
                {brief.overview}
              </p>
            </BriefSection>

            <BriefSection
              title={DASHBOARD_COPY.requirements}
              icon={ListChecks}
              className="mt-6"
            >
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted sm:text-base">
                {brief.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </BriefSection>

            <BriefSection
              title={DASHBOARD_COPY.deliverables}
              icon={Package}
              className="mt-6"
            >
              <div className="rounded-lg bg-brand-50 p-4 sm:p-5">
                <ul className="space-y-3">
                  {brief.deliverables.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <li
                        key={item.label}
                        className="flex items-center gap-3 text-sm font-medium text-foreground sm:text-base"
                      >
                        <ItemIcon className="h-4 w-4 shrink-0 text-brand-600" />
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </BriefSection>

            <BriefSection
              title={DASHBOARD_COPY.evaluationCriteria}
              icon={ClipboardCheck}
              className="mt-6"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {brief.criteria.map((criterion) => (
                  <div
                    key={criterion.title}
                    className="rounded-lg border border-border bg-white p-4"
                  >
                    <p className="font-semibold text-foreground">{criterion.title}</p>
                    <p className="mt-1 text-sm text-muted">{criterion.weight}</p>
                  </div>
                ))}
              </div>
            </BriefSection>

            <BriefSection
              title={DASHBOARD_COPY.resources}
              icon={Library}
              className="mt-6"
            >
              <ul className="space-y-3">
                {brief.resources.map((resource) => (
                  <li key={resource.label}>
                    <Link
                      href={resource.href}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface sm:text-base"
                    >
                      <span>{resource.label}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </BriefSection>
          </Card>

          {project.canApply ? (
            <div className="mt-4 flex justify-end">
              <Button size="md" className="w-full sm:w-auto">
                <Rocket className="h-4 w-4" />
                {DASHBOARD_COPY.startProject}
              </Button>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-center text-sm text-muted sm:text-base">
              {DASHBOARD_COPY.stageLockedMessage}
            </p>
          )}
        </div>
    </DashboardShell>
  );
}

function BriefHeader({
  brief,
  icon: Icon,
}: {
  brief: ProjectBrief;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border-b border-border pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-hero-heading sm:text-2xl">
            {brief.title}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">{brief.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <MetaTag icon={Clock} label={`Estimated time: ${brief.meta.estimatedTime}`} />
            <MetaTag icon={BarChart3} label={brief.meta.level} />
            <MetaTag icon={Wrench} label={brief.meta.discipline} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaTag({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted sm:text-sm">
      <Icon className="h-3.5 w-3.5 text-brand-600" />
      {label}
    </span>
  );
}

function BriefSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-hero-heading sm:text-lg">
        <Icon className="h-5 w-5 text-brand-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

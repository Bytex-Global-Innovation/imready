"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CircuitBoard,
  Cloud,
  Cpu,
  Database,
  Info,
  Layers,
  Monitor,
  type LucideIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  PROJECT_CATEGORIES,
  PROJECTS,
  type ProjectCategory,
  type ProjectCategoryTab,
  type ProjectItem,
} from "@/constants/projects";
import { ROUTES } from "@/constants/routes";
import {
  projectsApi,
  resolveMediaUrl,
  type ApiProjectItem,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const TECH_ICONS: Record<string, LucideIcon> = {
  python: Brain,
  tensorflow: Layers,
  react: Monitor,
  node: Cpu,
  aws: Cloud,
  sql: Database,
  default: CircuitBoard,
};

const CATEGORY_ICONS = [Brain, Layers, CircuitBoard, Cpu, Database, Monitor, Cloud];

function iconForTech(label: string): LucideIcon {
  const key = label.toLowerCase();
  for (const [token, icon] of Object.entries(TECH_ICONS)) {
    if (key.includes(token)) return icon;
  }
  return TECH_ICONS.default;
}

function mapApiProject(project: ApiProjectItem): ProjectItem {
  return {
    id: project.id,
    category: project.category,
    badge: project.badge,
    title: project.title,
    description: project.description,
    imageSrc:
      resolveMediaUrl(project.imageSrc) || "/images/projects/placeholder.jpg",
    imageAlt: project.imageAlt || project.title,
    requirements: project.requirements || [],
    techStack: (project.techStack || []).map((tech) => ({
      label: tech.label,
      icon: iconForTech(tech.label),
    })),
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
  };
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const isRemote =
    project.imageSrc.startsWith("http") || project.imageSrc.startsWith("blob:");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-sm">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface">
        {project.imageSrc ? (
          <Image
            src={project.imageSrc}
            alt={project.imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            unoptimized={isRemote}
          />
        ) : null}
        <span className="absolute bottom-2.5 left-2.5 rounded-[var(--radius-button)] bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          {project.badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-4.5">
        <h2 className="font-display text-base font-bold text-foreground sm:text-lg">
          {project.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
          {project.description}
        </p>

        <div className="mt-3.5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            Requirements
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {project.requirements.map((req) => (
              <span
                key={req}
                className="rounded-md bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            Tech Stack
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5">
            {project.techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <li
                  key={tech.label}
                  className="flex items-center gap-1 text-[11px] font-medium text-foreground"
                >
                  <Icon className="h-3 w-3 text-primary" />
                  {tech.label}
                </li>
              );
            })}
          </ul>
        </div>

        <Button
          size="sm"
          className="mt-4 w-full"
          href={ROUTES.projectDetail(project.id)}
        >
          Apply for Project
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}

export function ProjectsView() {
  const [categories, setCategories] =
    useState<ProjectCategoryTab[]>(PROJECT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>(
    PROJECT_CATEGORIES[0]?.id || "",
  );
  const [projects, setProjects] = useState<ProjectItem[]>(PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [categoriesData, projectsData] = await Promise.all([
          projectsApi.listCategories(),
          projectsApi.list(),
        ]);
        if (cancelled) return;

        if (categoriesData.categories.length > 0) {
          const mapped = categoriesData.categories.map((category, index) => ({
            id: category.slug,
            label: category.name,
            icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
          }));
          setCategories(mapped);
          setActiveCategory((current) =>
            mapped.some((item) => item.id === current)
              ? current
              : mapped[0].id,
          );
        }

        if (projectsData.projects.length > 0) {
          setProjects(projectsData.projects.map(mapApiProject));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load projects from server. Showing local catalog.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.category === activeCategory),
    [projects, activeCategory],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Available Projects – Stage 1
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">
          Select a project that aligns with your career goals. This selection
          will define your mentor track and final assessment criteria.
        </p>
      </header>

      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1 sm:mb-8 sm:flex-wrap"
        role="tablist"
        aria-label="Project categories"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const active = category.id === activeCategory;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:bg-surface",
              )}
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mb-4 text-sm text-amber-700" role="status">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted">Loading projects…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          No projects available in this category yet.
        </p>
      ) : null}

      <aside className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-start sm:gap-3 sm:px-5 sm:py-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground">
          Need help choosing? Schedule a 15-minute call with our career advisors
          to discuss which project best fits your future aspirations.{" "}
          <Link
            href={ROUTES.faq}
            className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            Book a slot now.
          </Link>
        </p>
      </aside>
    </div>
  );
}

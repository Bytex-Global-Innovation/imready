import { Clock } from "lucide-react";
import type { DashboardProject } from "@/constants/student-dashboard";
import { ROUTES } from "@/constants";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: DashboardProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const Icon = project.icon;

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <Badge className="bg-surface-alt text-muted">{project.stage}</Badge>
      </div>

      <h2 className="font-display text-lg font-bold text-hero-heading sm:text-xl">
        {project.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4" />
          {project.duration}
        </span>
        <Button
          href={ROUTES.dashboardProject(project.id)}
          variant={project.ctaVariant === "secondary" ? "secondary" : "primary"}
          size="sm"
          className={cn("w-full sm:w-auto")}
        >
          {project.ctaLabel}
        </Button>
      </div>
    </Card>
  );
}

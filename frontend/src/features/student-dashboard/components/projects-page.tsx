import {
  DASHBOARD_COPY,
  DASHBOARD_PROJECTS,
} from "@/constants/student-dashboard";
import {
  DashboardPageHeader,
  DashboardShell,
} from "./dashboard-shell";
import { ProjectCard } from "./project-card";

export function ProjectsPage() {
  return (
    <DashboardShell activeNav="projects" hideMobileBar>
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <DashboardPageHeader
          title={DASHBOARD_COPY.projectsPageTitle}
          subtitle={DASHBOARD_COPY.projectsPageSubtitle}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {DASHBOARD_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

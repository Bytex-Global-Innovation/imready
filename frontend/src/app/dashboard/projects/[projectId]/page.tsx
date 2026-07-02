import { ProjectBriefPage } from "@/features/student-dashboard";

interface ProjectBriefRouteProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBriefRoute({ params }: ProjectBriefRouteProps) {
  const { projectId } = await params;
  return <ProjectBriefPage projectId={projectId} />;
}

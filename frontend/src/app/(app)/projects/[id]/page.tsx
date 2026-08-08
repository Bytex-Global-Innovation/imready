import { ProjectBriefView } from "@/features/projects/components/project-brief-view";

export default async function ProjectBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectBriefView projectId={id} />;
}

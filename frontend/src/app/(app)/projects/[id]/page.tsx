import { notFound } from "next/navigation";
import { PROJECTS } from "@/constants/projects";
import { ProjectBriefView } from "@/features/projects/components/project-brief-view";

export default async function ProjectBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectExists = PROJECTS.some((item) => item.id === id);

  if (!projectExists) {
    notFound();
  }

  return <ProjectBriefView projectId={id} />;
}
import { Stage2ProjectWorkspaceLoader } from "@/features/stage2/components/stage2-project-workspace-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectWorkspacePage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectWorkspaceLoader projectId={projectId} />;
}

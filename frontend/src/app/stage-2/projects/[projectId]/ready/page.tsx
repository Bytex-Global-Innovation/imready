import { Stage2ReadyFrameworkLoader } from "@/features/stage2/components/stage2-ready-framework-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectReadyPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ReadyFrameworkLoader projectId={projectId} />;
}

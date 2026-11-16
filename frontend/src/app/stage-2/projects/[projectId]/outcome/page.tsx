import { Stage2ProjectOutcomeLoader } from "@/features/stage2/components/stage2-project-outcome-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectOutcomePage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectOutcomeLoader projectId={projectId} />;
}

import { Stage2TeamFormationLoader } from "@/features/stage2/components/stage2-team-formation-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectTeamPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2TeamFormationLoader projectId={projectId} />;
}

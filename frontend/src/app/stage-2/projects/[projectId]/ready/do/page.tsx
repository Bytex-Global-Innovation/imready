import { Stage2DoProofLoader } from "@/features/stage2/components/stage2-do-proof-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectDoProofPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2DoProofLoader projectId={projectId} />;
}

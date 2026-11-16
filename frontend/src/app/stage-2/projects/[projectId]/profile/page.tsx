import { Stage2VerifiedProfileLoader } from "@/features/stage2/components/stage2-verified-profile-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectProfilePage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2VerifiedProfileLoader projectId={projectId} />;
}

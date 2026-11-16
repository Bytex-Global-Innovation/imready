import { Stage2OwnerFeedbackLoader } from "@/features/stage2/components/stage2-owner-feedback-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2OwnerFeedbackPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2OwnerFeedbackLoader projectId={projectId} />;
}

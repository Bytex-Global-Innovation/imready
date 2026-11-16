import { Stage2ProjectReviewLoader } from "@/features/stage2/components/stage2-project-review-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectReviewPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectReviewLoader projectId={projectId} />;
}

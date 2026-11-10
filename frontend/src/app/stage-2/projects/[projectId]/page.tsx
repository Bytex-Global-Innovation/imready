import { Stage2ProjectDetailLoader } from "@/features/stage2/components/stage2-project-detail-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectDetailLoader projectId={projectId} />;
}

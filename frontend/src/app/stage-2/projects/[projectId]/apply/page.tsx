import { Stage2ProjectApplyLoader } from "@/features/stage2/components/stage2-project-apply-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectApplyPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectApplyLoader projectId={projectId} />;
}

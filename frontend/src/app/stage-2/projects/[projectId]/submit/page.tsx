import { Stage2ProjectSubmitLoader } from "@/features/stage2/components/stage2-project-submit-loader";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function Stage2ProjectSubmitPage({ params }: PageProps) {
  const { projectId } = await params;
  return <Stage2ProjectSubmitLoader projectId={projectId} />;
}

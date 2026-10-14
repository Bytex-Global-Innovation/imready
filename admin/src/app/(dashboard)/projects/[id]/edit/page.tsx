"use client";

import { use } from "react";
import ProjectForm from "@/components/ui/project-form";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProjectForm mode="edit" projectId={id} />;
}

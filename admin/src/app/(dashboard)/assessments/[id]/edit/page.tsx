"use client";

import { useParams } from "next/navigation";
import AssessmentForm from "@/components/ui/assessment-form";

export default function EditAssessmentPage() {
  const params = useParams<{ id: string }>();
  return <AssessmentForm mode="edit" assessmentId={params.id} />;
}

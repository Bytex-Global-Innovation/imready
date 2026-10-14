"use client";

import { notFound, useParams } from "next/navigation";
import { MissionCompleteView } from "@/features/missions/components/mission-complete-view";

export default function MissionCompletePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (!Number.isInteger(id) || id < 1 || id > 4) {
    notFound();
  }

  return <MissionCompleteView missionId={id} />;
}
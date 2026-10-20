"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { MissionCompleteView } from "@/features/missions/components/mission-complete-view";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
  getMissionRecord,
  isMissionAccessible,
} from "@/features/missions/lib/mission-progress";

export default function MissionCompletePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id >= 1 && id <= 4;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!valid) return;
    ensureFoundationProgress()
      .then(() => {
        if (!isMissionAccessible(id)) {
          router.replace(ROUTES.mission(firstIncompleteMissionId()));
          return;
        }
        const record = getMissionRecord(id);
        if (!record.completed) {
          router.replace(ROUTES.mission(id));
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace(ROUTES.dashboard));
  }, [valid, id, router]);

  if (!valid) notFound();
  if (!ready) {
    return <div className="py-12 text-center text-sm text-muted">Loading…</div>;
  }

  return <MissionCompleteView missionId={id} />;
}

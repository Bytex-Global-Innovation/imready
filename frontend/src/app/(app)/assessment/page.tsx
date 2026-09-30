"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
  isFoundationComplete,
} from "@/features/missions/lib/mission-progress";

export default function AssessmentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureFoundationProgress()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (isFoundationComplete()) {
      router.replace(ROUTES.foundationComplete);
      return;
    }
    router.replace(ROUTES.mission(firstIncompleteMissionId()));
  }, [ready, router]);

  return null;
}

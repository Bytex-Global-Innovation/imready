"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { firstIncompleteMissionId, isFoundationComplete } from "@/features/missions/lib/mission-progress";

export default function AssessmentPage() {
  const router = useRouter();

  useEffect(() => {
    if (isFoundationComplete()) {
      router.replace(ROUTES.foundationComplete);
      return;
    }
    router.replace(ROUTES.mission(firstIncompleteMissionId()));
  }, [router]);

  return null;
}

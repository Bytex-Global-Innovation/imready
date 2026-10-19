"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { FoundationProblemSelect } from "@/features/missions/components/foundation-problem-select";
import {
  ensureFoundationProgress,
  firstIncompleteMissionId,
  hasFoundationProblemSelected,
  isFoundationComplete,
} from "@/features/missions/lib/mission-progress";

export default function AssessmentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [needsProblem, setNeedsProblem] = useState(false);

  useEffect(() => {
    ensureFoundationProgress()
      .then((progress) => {
        if (isFoundationComplete()) {
          router.replace(ROUTES.foundationComplete);
          return;
        }
        if (!hasFoundationProblemSelected() && !progress.foundationProblemStatementId) {
          setNeedsProblem(true);
          setReady(true);
          return;
        }
        router.replace(ROUTES.mission(firstIncompleteMissionId()));
      })
      .catch(() => {
        setNeedsProblem(true);
        setReady(true);
      });
  }, [router]);

  if (!ready) return null;

  if (needsProblem) {
    return <FoundationProblemSelect />;
  }

  return null;
}

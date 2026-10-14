"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ensureFoundationProgress, isMissionUnlocked } from "@/features/missions/lib/mission-progress";
import { Mission1Reality } from "@/features/missions/components/mission-1-reality";
import { Mission2Engage } from "@/features/missions/components/mission-2-engage";
import { Mission3Analyze } from "@/features/missions/components/mission-3-analyze";
import { Mission4Do } from "@/features/missions/components/mission-4-do";
import { Mission5Yield } from "@/features/missions/components/mission-5-yield";

export default function MissionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id >= 1 && id <= 5;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!valid) return;
    ensureFoundationProgress()
      .then(() => {
        if (!isMissionUnlocked(id)) {
          router.replace(ROUTES.assessment);
          return;
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [valid, id, router]);

  if (!valid) notFound();
  if (!ready) {
    return <div className="py-12 text-center text-sm text-muted">Loading mission…</div>;
  }

  switch (id) {
    case 1:
      return <Mission1Reality />;
    case 2:
      return <Mission2Engage />;
    case 3:
      return <Mission3Analyze />;
    case 4:
      return <Mission4Do />;
    case 5:
      return <Mission5Yield />;
    default:
      return null;
  }
}

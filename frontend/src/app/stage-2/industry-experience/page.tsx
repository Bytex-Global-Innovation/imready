import type { Metadata } from "next";
import { IndustryExperienceView } from "@/features/stage2/components/industry-experience-view";

export const metadata: Metadata = {
  title: "Stage 2 – Industry Experience | ImReady",
  description:
    "From Foundation completion to joining a verified real-world project team.",
};

export default function Stage2IndustryExperiencePage() {
  return <IndustryExperienceView />;
}

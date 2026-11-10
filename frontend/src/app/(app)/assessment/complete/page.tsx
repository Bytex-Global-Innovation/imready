import type { Metadata } from "next";
import { IndustryExperienceView } from "@/features/stage2/components/industry-experience-view";

export const metadata: Metadata = {
  title: "Stage 2 – Industry Experience | ImReady",
  description:
    "From Foundation completion to joining a verified real-world project team.",
};

/** Same Stage 2 Industry Experience UI as `/stage-2/industry-experience`. */
export default function FoundationCompletePage() {
  return (
    <div className="stage2-shell min-h-full bg-[#f8f9ff] text-[#0b1c30] antialiased">
      <IndustryExperienceView />
    </div>
  );
}

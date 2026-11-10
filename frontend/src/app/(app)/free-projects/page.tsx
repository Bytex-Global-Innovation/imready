import { UnpaidProjectsCatalogueView } from "@/features/stage2/components/unpaid-projects-catalogue-view";

export default function FreeProjectsPage() {
  return (
    <div className="stage2-shell min-h-full bg-[#f8f9ff] text-[#0b1c30] antialiased">
      <UnpaidProjectsCatalogueView />
    </div>
  );
}

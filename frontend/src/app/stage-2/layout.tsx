import { StudentAuthGate } from "@/components/auth/student-auth-gate";
import { AppShell } from "@/components/layout/app-sidebar";
import { Stage2PreviewBanner } from "@/features/stage2/components/stage2-preview-banner";
import { STAGE2_UI_PREVIEW_ENABLED } from "@/features/stage2/lib/stage2-preview-bundle";

export default function Stage2Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthGate>
      <AppShell>
        <div className="stage2-shell min-h-full bg-[#f8f9ff] text-[#0b1c30] antialiased">
          {STAGE2_UI_PREVIEW_ENABLED ? <Stage2PreviewBanner /> : null}
          {children}
        </div>
      </AppShell>
    </StudentAuthGate>
  );
}

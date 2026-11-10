import { StudentAuthGate } from "@/components/auth/student-auth-gate";
import { AppShell } from "@/components/layout/app-sidebar";

export default function Stage2Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthGate>
      <AppShell>
        <div className="stage2-shell min-h-full bg-[#f8f9ff] text-[#0b1c30] antialiased">
          {children}
        </div>
      </AppShell>
    </StudentAuthGate>
  );
}

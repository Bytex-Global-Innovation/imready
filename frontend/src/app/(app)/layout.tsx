"use client";

import { StudentAuthGate } from "@/components/auth/student-auth-gate";
import { AppShell } from "@/components/layout/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentAuthGate>
      <AppShell>{children}</AppShell>
    </StudentAuthGate>
  );
}

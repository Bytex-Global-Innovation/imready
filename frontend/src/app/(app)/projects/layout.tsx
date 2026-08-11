"use client";

import { StudentAuthGate } from "@/components/auth/student-auth-gate";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentAuthGate requireProjectsUnlocked>{children}</StudentAuthGate>
  );
}

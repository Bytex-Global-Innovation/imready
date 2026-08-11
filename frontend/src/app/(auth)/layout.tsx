import { GuestOnlyGate } from "@/components/auth/guest-only-gate";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestOnlyGate>
      <div className="auth-shell min-h-0 flex-1 bg-surface text-[#153a75]">
        <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">{children}</main>
      </div>
    </GuestOnlyGate>
  );
}

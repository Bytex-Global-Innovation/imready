import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/layout/auth-header";
import { ResetPasswordForm } from "@/features/login";
import { ROUTES, SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `Reset Password — ${SITE_CONFIG.name}`,
  description: "Set a new password for your ImReady account.",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { email } = await searchParams;

  if (!email?.trim()) {
    redirect(ROUTES.forgotPassword);
  }

  return (
    <div className="auth-shell min-h-screen bg-surface text-[#153a75]">
      <AuthHeader />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <ResetPasswordForm email={email.trim()} />
      </main>
    </div>
  );
}

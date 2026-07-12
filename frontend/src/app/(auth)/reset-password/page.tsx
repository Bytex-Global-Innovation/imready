import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/features/login/components/reset-password-form";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

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

  return <ResetPasswordForm email={email.trim()} />;
}

import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/login/components/forgot-password-form";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Forgot Password — ${SITE_CONFIG.name}`,
  description: "Reset your ImReady account password using your registered email address.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

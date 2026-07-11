import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { ForgotPasswordForm } from "@/features/login";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `Forgot Password — ${SITE_CONFIG.name}`,
  description: "Reset your ImReady account password using your registered email address.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell min-h-screen bg-surface text-[#153a75]">
      <AuthHeader />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}

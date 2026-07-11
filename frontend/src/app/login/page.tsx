import type { Metadata } from "next";
import { AuthHeader } from "@/components/layout/auth-header";
import { LoginForm } from "@/features/login";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `Log In — ${SITE_CONFIG.name}`,
  description: "Sign in to your ImReady account and continue building industry-ready experience.",
};

export default function LoginPage() {
  return (
    <div className="auth-shell min-h-screen bg-surface text-[#153a75]">
      <AuthHeader />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <LoginForm />
      </main>
    </div>
  );
}

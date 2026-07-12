import type { Metadata } from "next";
import { LoginForm } from "@/features/login/components/login-form";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Log In — ${SITE_CONFIG.name}`,
  description: "Sign in to your ImReady account and continue building industry-ready experience.",
};

export default function LoginPage() {
  return <LoginForm />;
}

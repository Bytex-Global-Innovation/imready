import type { Metadata } from "next";
import { SignupForm } from "@/features/signup/components/signup-form";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Join ${SITE_CONFIG.name}`,
  description:
    "Create your ImReady account and start building real industry experience before Semester 3.",
};

export default function SignupPage() {
  return <SignupForm />;
}

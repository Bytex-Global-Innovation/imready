import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthHeader } from "@/components/layout/auth-header";
import { SignupForm } from "@/features/signup";
import { isSignupStep, SITE_CONFIG } from "@/constants";

interface SignupStepPageProps {
  params: Promise<{ stepNumber: string }>;
}

export async function generateMetadata({
  params,
}: SignupStepPageProps): Promise<Metadata> {
  const { stepNumber } = await params;
  const step = Number(stepNumber);

  const stepTitles: Record<number, string> = {
    1: "Personal Info",
    2: "Academic Details",
    3: "Choose Your Door",
  };

  const stepTitle = stepTitles[step] ?? "Sign Up";

  return {
    title: `Join ${SITE_CONFIG.name} — ${stepTitle}`,
    description:
      "Create your ImReady account and start building real industry experience before Semester 3.",
  };
}

export default async function SignupStepPage({ params }: SignupStepPageProps) {
  const { stepNumber } = await params;
  const step = Number(stepNumber);

  if (!isSignupStep(step)) {
    notFound();
  }

  return (
    <div className="auth-shell min-h-screen bg-surface text-[#153a75]">
      <AuthHeader />
      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <SignupForm step={step} />
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailView } from "@/features/login/components/verify-email-view";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Verify Email — ${SITE_CONFIG.name}`,
  description: "Verify your ImReady student account email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted">
          Verifying your email…
        </div>
      }
    >
      <VerifyEmailView />
    </Suspense>
  );
}

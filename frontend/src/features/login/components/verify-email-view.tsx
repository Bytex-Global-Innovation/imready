"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ApiError, authApi } from "@/lib/api";

/** After email verification, always land on the student dashboard. */
function resolvePostVerifyPath() {
  return ROUTES.dashboard;
}

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "Verifying your email…" : "Missing verification token.",
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function run() {
      try {
        const result = await authApi.verifyEmail(token);
        if (cancelled) return;

        const destination = resolvePostVerifyPath();

        setStatus("success");
        setMessage("Email verified. Taking you to your dashboard…");
        router.replace(destination);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Verification failed.",
        );
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, token]);

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#153a75]">
          Email Verification
        </h1>
      </header>
      <Card className="space-y-4 border-border/80 p-6 text-center shadow-md">
        <p
          className={
            status === "error" ? "text-sm text-red-600" : "text-sm text-muted"
          }
        >
          {message}
        </p>
        {status === "error" ? (
          <div className="flex flex-col gap-2">
            <Button
              href={ROUTES.login}
              className="w-full bg-[#153a75] hover:bg-[#102b55]"
            >
              Back to Login
            </Button>
            <Link
              href={ROUTES.login}
              className="text-sm font-medium text-[#153a75] hover:text-primary-hover"
            >
              Go to login to resend verification if needed
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

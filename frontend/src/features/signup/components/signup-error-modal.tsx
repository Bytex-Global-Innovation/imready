"use client";

import { AlertTriangle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface SignupErrorModalProps {
  message: string;
  onClose: () => void;
  showLoginAction?: boolean;
}

export function SignupErrorModal({
  message,
  onClose,
  showLoginAction = false,
}: SignupErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="signup-error-title"
        aria-describedby="signup-error-message"
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>

        <h2
          id="signup-error-title"
          className="font-display text-xl font-bold text-foreground"
        >
          Unable to create account
        </h2>

        <p
          id="signup-error-message"
          className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base"
        >
          {message}
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {showLoginAction ? (
            <Button
              href={ROUTES.login}
              className="w-full bg-[#153a75] hover:bg-[#102b55]"
            >
              Go to Login
            </Button>
          ) : null}
          <Button
            type="button"
            variant={showLoginAction ? "secondary" : "primary"}
            onClick={onClose}
            className="w-full"
          >
            {showLoginAction ? "Close" : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
}

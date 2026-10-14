"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface ApplySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export function ApplySuccessModal({
  isOpen,
  onClose,
  projectTitle,
}: ApplySuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleGoToDashboard() {
    onClose();
    router.push(`${ROUTES.dashboard}?applied=true`);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-success-title"
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>

        <h2
          id="apply-success-title"
          className="font-display text-xl font-bold text-foreground sm:text-2xl"
        >
          Application Submitted!
        </h2>

        <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
          Your application for the project{" "}
          <span className="font-semibold text-foreground">{projectTitle}</span>{" "}
          has been sent.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3">
          <Button onClick={handleGoToDashboard} className="w-full">
            Go to Dashboard
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-medium text-primary hover:text-primary-hover"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

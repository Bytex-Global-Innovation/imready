"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";

const PREMIUM_BENEFITS = [
  "Unlock Stage 01 premium curriculum",
  "Access specialized premium learning paths",
  "Work on exclusive industry projects",
  "Priority mentor guidance & community",
  "Verified portfolio boost for placements",
] as const;

type SubscriptionStatus = "FREE" | "PREMIUM_PENDING" | "PREMIUM";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionStatus?: SubscriptionStatus;
  onRequested?: () => Promise<void> | void;
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  subscriptionStatus = "FREE",
  onRequested,
}: UpgradePlanModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPremium = subscriptionStatus === "PREMIUM";

  async function handleSelectPlan() {
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.requestPremium();
      await onRequested?.();
      onClose();
      router.push(ROUTES.details);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit your premium request.",
      );
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-plan-title"
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-xl sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 cursor-pointer rounded-md p-1.5 text-muted hover:bg-surface hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Premium
        </p>
        <h2
          id="upgrade-plan-title"
          className="mt-1 font-display text-2xl font-bold text-foreground"
        >
          Premium Unlock
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isPremium
            ? "Premium is active on your account. Advanced stages and exclusive industry projects are unlocked."
            : subscriptionStatus === "PREMIUM_PENDING"
              ? "Your premium request is waiting for admin approval. Complete payment on the details page if you have not already."
              : "Upgrade to the premium path and unlock advanced stages and exclusive industry projects. Pay via UPI, upload your screenshot, and an admin will approve access."}
        </p>

        <ul className="mt-5 space-y-2.5">
          {PREMIUM_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3">
          {isPremium ? (
            <Button type="button" onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleSelectPlan}
                disabled={isSubmitting}
                className="w-full bg-[#153a75] hover:bg-[#102b55]"
              >
                {isSubmitting ? "Opening details…" : "Continue to Payment"}
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer text-sm font-medium text-muted hover:text-foreground"
              >
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const UPGRADE_TOOLTIP_BENEFITS = [
  "Unlock Stage 01 curriculum",
  "Premium learning paths",
  "Premium industry projects",
  "Priority mentor support",
] as const;

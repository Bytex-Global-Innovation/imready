"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";

const PREMIUM_BENEFITS = [
  "Unlock Stage 01 premium curriculum",
  "Access specialized Bytex hardware paths",
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
      router.push(ROUTES.bytex);
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
          Bytex Unlock
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isPremium
            ? "Premium is active on your account. Hardware paths, advanced stages, and exclusive industry projects are unlocked."
            : subscriptionStatus === "PREMIUM_PENDING"
              ? "Your premium request is waiting for admin approval. You can still visit Bytex while you wait."
              : "Upgrade to the premium path and unlock specialized hardware learning, advanced stages, and exclusive industry projects. Access is granted after an admin approves your request."}
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
                {isSubmitting ? "Opening Bytex…" : "Select Plan"}
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
  "Bytex hardware learning paths",
  "Premium industry projects",
  "Priority mentor support",
] as const;

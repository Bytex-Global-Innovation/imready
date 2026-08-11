"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const PREMIUM_BENEFITS = [
  "Unlock Stage 01 premium curriculum",
  "Access specialized Bytex hardware paths",
  "Work on exclusive industry projects",
  "Priority mentor guidance & community",
  "Verified portfolio boost for placements",
] as const;

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleSelectPlan() {
    onClose();
    router.push(ROUTES.bytex);
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
          onClick={onClose}
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
          Upgrade to the premium path and unlock specialized hardware learning,
          advanced stages, and exclusive industry projects.
        </p>

        <ul className="mt-5 space-y-2.5">
          {PREMIUM_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleSelectPlan}
            className="w-full bg-[#153a75] hover:bg-[#102b55]"
          >
            Select Plan
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-sm font-medium text-muted hover:text-foreground"
          >
            Maybe later
          </button>
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

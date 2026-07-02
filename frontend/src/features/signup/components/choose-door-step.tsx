"use client";

import Link from "next/link";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { CAREER_DOORS } from "../constants/career-doors";
import type { SignupFormValues } from "../schemas/signup-schemas";

interface ChooseDoorStepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  selectedDoor?: string;
  agreedToTerms: boolean;
  setValue: UseFormSetValue<SignupFormValues>;
  isSubmitting: boolean;
  onBack: () => void;
}

function DocumentIcon() {
  return (
    <svg
      className="h-5 w-5 text-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      className="h-5 w-5 text-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    </svg>
  );
}

function DoorIcon({ type }: { type: "document" | "monitor" }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
      {type === "document" ? <DocumentIcon /> : <MonitorIcon />}
    </div>
  );
}

export function ChooseDoorStep({
  register,
  errors,
  selectedDoor,
  agreedToTerms,
  setValue,
  isSubmitting,
  onBack,
}: ChooseDoorStepProps) {
  const canSubmit = Boolean(selectedDoor && agreedToTerms && !isSubmitting);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Choose Your Door
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted sm:text-base">
          Select the path that best aligns with how you want to demonstrate your
          readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CAREER_DOORS.map((door) => {
          const isSelected = selectedDoor === door.id;

          return (
            <div
              key={door.id}
              className={cn(
                "flex flex-col rounded-[var(--radius-card)] border p-5 transition-colors sm:p-6",
                isSelected
                  ? "border-[#153a75] bg-brand-50/40 ring-1 ring-[#153a75]/15"
                  : "border-border bg-white",
              )}
            >
              <div className="mb-4 flex items-start gap-3">
                <DoorIcon type={door.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {door.title}
                    </h3>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
                        door.badgeVariant === "premium"
                          ? "bg-brand-100 text-foreground"
                          : "bg-brand-50 text-foreground",
                      )}
                    >
                      {door.badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                {door.description}
              </p>

              <input
                type="radio"
                value={door.id}
                className="sr-only"
                {...register("careerDoor")}
              />

              <button
                type="button"
                onClick={() =>
                  setValue("careerDoor", door.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "w-full cursor-pointer rounded-[var(--radius-button)] border py-2.5 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-[#153a75] bg-primary text-white hover:bg-primary-hover"
                    : "border-border bg-white text-[#153a75] hover:border-[#153a75]/40 hover:bg-surface",
                )}
              >
                Choose This Door
              </button>
            </div>
          );
        })}
      </div>

      {errors.careerDoor?.message && (
        <p className="text-center text-xs text-red-600" role="alert">
          {errors.careerDoor.message}
        </p>
      )}

      <div className="space-y-4 border-t border-border pt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-foreground focus:ring-foreground/30"
            {...register("agreedToTerms")}
          />
          <span className="text-sm leading-relaxed text-muted">
            I agree to the{" "}
            <Link
              href={ROUTES.terms}
              className="font-medium text-foreground underline-offset-2 hover:underline cursor-pointer"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.privacy}
              className="font-medium text-foreground underline-offset-2 hover:underline cursor-pointer"
            >
              Privacy Policy
            </Link>
            . I understand that my selection here determines the next phase of
            my evaluation.
          </span>
        </label>

        {errors.agreedToTerms?.message && (
          <p className="text-xs text-red-600" role="alert">
            {errors.agreedToTerms.message}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "h-12 w-full rounded-[var(--radius-button)] text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2",
            canSubmit
              ? "cursor-pointer bg-primary text-white hover:bg-primary-hover"
              : "cursor-not-allowed bg-border text-muted",
          )}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mx-auto block cursor-pointer text-sm font-medium text-muted transition-colors hover:text-[#153a75]"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

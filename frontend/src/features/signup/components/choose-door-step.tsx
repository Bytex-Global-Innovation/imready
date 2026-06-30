"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CAREER_DOORS, type SignupFormValues } from "../schemas/signup-schemas";

interface ChooseDoorStepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  selectedDoor?: string;
}

export function ChooseDoorStep({
  register,
  errors,
  selectedDoor,
}: ChooseDoorStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
          Choose Your Door
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pick the track that best matches how you want to start on IMReady.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-1">
        {CAREER_DOORS.map((door) => (
          <label
            key={door.id}
            className={cn(
              "relative flex cursor-pointer flex-col rounded-[var(--radius-card)] border p-4 transition-colors sm:p-5",
              "hover:border-foreground/40 hover:bg-brand-50/50",
              selectedDoor === door.id
                ? "border-foreground bg-brand-50 ring-1 ring-foreground/20"
                : "border-border bg-white",
            )}
          >
            <input
              type="radio"
              value={door.id}
              className="sr-only"
              {...register("careerDoor")}
            />
            <span className="font-semibold text-foreground">{door.title}</span>
            <span className="mt-1 text-sm text-muted">{door.description}</span>
            {selectedDoor === door.id && (
              <span
                className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-white sm:right-4 sm:top-4"
                aria-hidden="true"
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </label>
        ))}
      </div>

      {errors.careerDoor?.message && (
        <p className="text-xs text-red-600" role="alert">
          {errors.careerDoor.message}
        </p>
      )}
    </div>
  );
}

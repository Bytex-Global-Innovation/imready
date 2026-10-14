"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  COLLEGE_OPTIONS,
  GRADUATION_YEARS,
  STREAM_OPTIONS,
  TARGET_DOMAINS,
  type SignupFormValues,
} from "../schemas/signup-schemas";
import { DomainIcon } from "./domain-icons";

interface AcademicDetailsStepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  selectedDomain?: string;
}

export function AcademicDetailsStep({
  register,
  errors,
  selectedDomain,
}: AcademicDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
          Academic Background
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tell us where you are studying and what domain you are aiming for.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="college" required>
            College / Institution
          </Label>
          <Select
            id="college"
            error={errors.college?.message}
            {...register("college")}
          >
            <option value="" disabled>
              Select your college
            </option>
            {COLLEGE_OPTIONS.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="streamMajor" required>
              Stream / Major
            </Label>
            <Select
              id="streamMajor"
              error={errors.streamMajor?.message}
              {...register("streamMajor")}
            >
              <option value="" disabled>
                Select Stream
              </option>
              {STREAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="graduationYear" required>
              Year of Graduation
            </Label>
            <Select
              id="graduationYear"
              error={errors.graduationYear?.message}
              {...register("graduationYear")}
            >
              <option value="" disabled>
                Select Year
              </option>
              {GRADUATION_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <div>
          <h3 className="font-display text-base font-bold text-foreground sm:text-lg">
            Target Domain
          </h3>
          <p className="mt-1 text-sm text-muted">
            Select your primary area of interest. You can adjust this later.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {TARGET_DOMAINS.map((domain) => (
            <label
              key={domain.id}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border px-3 py-5 text-center transition-colors",
                "hover:border-[#153a75]/40 hover:bg-brand-50/50",
                selectedDomain === domain.id
                  ? "border-[#153a75] bg-brand-50 ring-1 ring-[#153a75]/20"
                  : "border-border bg-white",
              )}
            >
              <input
                type="radio"
                value={domain.id}
                className="sr-only"
                {...register("targetDomain")}
              />
              <DomainIcon
                domain={domain.id}
                className={
                  selectedDomain === domain.id
                    ? "text-foreground"
                    : "text-muted"
                }
              />
              <span
                className={cn(
                  "text-xs font-medium sm:text-sm",
                  selectedDomain === domain.id
                    ? "text-foreground"
                    : "text-foreground/80",
                )}
              >
                {domain.label}
              </span>
            </label>
          ))}
        </div>

        {errors.targetDomain?.message && (
          <p className="text-xs text-red-600" role="alert">
            {errors.targetDomain.message}
          </p>
        )}
      </div>
    </div>
  );
}
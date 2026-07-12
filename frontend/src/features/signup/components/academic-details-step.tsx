"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
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

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4 text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

const fieldBaseClass =
  "h-11 w-full min-w-0 cursor-pointer rounded-[var(--radius-button)] border bg-white px-3.5 text-sm text-foreground transition-colors placeholder:text-muted/70 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";

const fieldErrorClass = "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20";

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
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              id="college"
              type="text"
              placeholder="Search your college..."
              autoComplete="organization"
              className={cn(
                fieldBaseClass,
                "cursor-text pl-10 pr-10",
                errors.college ? fieldErrorClass : "border-border",
              )}
              aria-invalid={errors.college ? true : undefined}
              aria-describedby={errors.college ? "college-error" : undefined}
              {...register("college")}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.college?.message && (
            <p id="college-error" className="text-xs text-red-600" role="alert">
              {errors.college.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="streamMajor" required>
              Stream / Major
            </Label>
            <div className="relative min-w-0">
              <select
                id="streamMajor"
                defaultValue=""
                className={cn(
                  fieldBaseClass,
                  "appearance-none truncate pr-10",
                  errors.streamMajor ? fieldErrorClass : "border-border",
                )}
                aria-invalid={errors.streamMajor ? true : undefined}
                aria-describedby={
                  errors.streamMajor ? "streamMajor-error" : undefined
                }
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
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.streamMajor?.message && (
              <p id="streamMajor-error" className="text-xs text-red-600" role="alert">
                {errors.streamMajor.message}
              </p>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="graduationYear" required>
              Year of Graduation
            </Label>
            <div className="relative min-w-0">
              <select
                id="graduationYear"
                defaultValue=""
                className={cn(
                  fieldBaseClass,
                  "appearance-none pr-10",
                  errors.graduationYear ? fieldErrorClass : "border-border",
                )}
                aria-invalid={errors.graduationYear ? true : undefined}
                aria-describedby={
                  errors.graduationYear ? "graduationYear-error" : undefined
                }
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
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.graduationYear?.message && (
              <p
                id="graduationYear-error"
                className="text-xs text-red-600"
                role="alert"
              >
                {errors.graduationYear.message}
              </p>
            )}
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

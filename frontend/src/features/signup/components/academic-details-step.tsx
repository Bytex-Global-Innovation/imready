"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { authApi, type TargetDomainItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  COLLEGE_OPTIONS,
  COLLEGE_OTHER_VALUE,
  GRADUATION_YEARS,
  STREAM_OPTIONS,
  type SignupFormValues,
} from "../schemas/signup-schemas";
import { DomainIcon } from "./domain-icons";

interface AcademicDetailsStepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  selectedDomains: string[];
  selectedCollege?: string;
  setValue: UseFormSetValue<SignupFormValues>;
  agreedToTerms: boolean;
}

export function AcademicDetailsStep({
  register,
  errors,
  selectedDomains,
  selectedCollege,
  setValue,
  agreedToTerms,
}: AcademicDetailsStepProps) {
  const [domains, setDomains] = useState<TargetDomainItem[]>([]);
  const [domainsError, setDomainsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authApi
      .listTargetDomains()
      .then((res) => {
        if (!cancelled) setDomains(res.domains);
      })
      .catch(() => {
        if (!cancelled) {
          setDomainsError("Could not load target domains. Refresh and try again.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const includesOther = selectedDomains.includes("other");

  function toggleDomain(slug: string) {
    const next = selectedDomains.includes(slug)
      ? selectedDomains.filter((item) => item !== slug)
      : [...selectedDomains, slug];
    setValue("targetDomains", next, { shouldValidate: true });
    if (!next.includes("other")) {
      setValue("targetDomainOther", "", { shouldValidate: true });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
          Academic Background
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tell us where you are studying and what domains you are aiming for.
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

        {selectedCollege === COLLEGE_OTHER_VALUE ? (
          <div className="space-y-1.5">
            <Label htmlFor="collegeOtherName" required>
              Your college name
            </Label>
            <Input
              id="collegeOtherName"
              placeholder="Enter your college or institution"
              error={errors.collegeOtherName?.message}
              {...register("collegeOtherName")}
            />
          </div>
        ) : null}

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
            Target Domains
          </h3>
          <p className="mt-1 text-sm text-muted">
            Select all areas that interest you. You can update this later.
          </p>
        </div>

        {domainsError ? (
          <p className="text-sm text-red-600" role="alert">{domainsError}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {domains.map((domain) => {
            const selected = selectedDomains.includes(domain.slug);
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => toggleDomain(domain.slug)}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border px-3 py-5 text-center transition-colors",
                  "hover:border-[#153a75]/40 hover:bg-brand-50/50",
                  selected
                    ? "border-[#153a75] bg-brand-50 ring-1 ring-[#153a75]/20"
                    : "border-border bg-white",
                )}
              >
                <DomainIcon
                  domain={domain.slug}
                  className={selected ? "text-foreground" : "text-muted"}
                />
                <span
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    selected ? "text-foreground" : "text-foreground/80",
                  )}
                >
                  {domain.name}
                </span>
              </button>
            );
          })}
        </div>

        {includesOther ? (
          <div className="space-y-1.5">
            <Label htmlFor="targetDomainOther" required>
              Your target domain
            </Label>
            <Input
              id="targetDomainOther"
              placeholder="e.g. Cybersecurity, Data Engineering"
              error={errors.targetDomainOther?.message}
              {...register("targetDomainOther")}
            />
          </div>
        ) : null}

        {errors.targetDomains?.message ? (
          <p className="text-xs text-red-600" role="alert">
            {String(errors.targetDomains.message)}
          </p>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary focus:ring-primary"
            {...register("agreedToTerms")}
          />
          <span>
            I agree to the{" "}
            <Link
              href={ROUTES.terms}
              className="font-medium text-primary underline-offset-2 hover:underline"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.privacy}
              className="font-medium text-primary underline-offset-2 hover:underline"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agreedToTerms?.message ? (
          <p className="text-xs text-red-600" role="alert">
            {errors.agreedToTerms.message}
          </p>
        ) : null}
        {!agreedToTerms ? null : (
          <p className="text-xs text-muted" aria-live="polite">
            
          </p>
        )}
      </div>
    </div>
  );
}

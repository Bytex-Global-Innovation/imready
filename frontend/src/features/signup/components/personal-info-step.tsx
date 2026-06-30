"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input, Label } from "@/components/ui";
import { COUNTRY_CODES, type SignupFormValues } from "../schemas/signup-schemas";

interface PersonalInfoStepProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
}

export function PersonalInfoStep({ register, errors }: PersonalInfoStepProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
        Personal Information
      </h2>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" required>
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" required>
            Phone Number
          </Label>
          <div className="flex gap-2">
            <div className="relative w-[7.5rem] shrink-0 sm:w-28">
              <select
                id="countryCode"
                className="h-11 w-full appearance-none rounded-[var(--radius-button)] border border-border bg-white px-2.5 pr-7 text-sm text-foreground focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                aria-label="Country code"
                {...register("countryCode")}
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 000-0000"
              autoComplete="tel-national"
              className="flex-1"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" required>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <p className="text-xs text-muted">Must be at least 8 characters.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" required>
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
      </div>
    </div>
  );
}

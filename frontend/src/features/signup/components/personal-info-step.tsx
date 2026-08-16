"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="w-full min-w-0 shrink-0 sm:w-28">
              <Select
                id="countryCode"
                aria-label="Country code"
                {...register("countryCode")}
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </Select>
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

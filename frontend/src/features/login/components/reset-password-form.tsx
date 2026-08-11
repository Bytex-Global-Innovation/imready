"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password-schema";

const AUTH_BUTTON_CLASS =
  "w-full cursor-pointer bg-[#153a75] text-white hover:bg-[#102b55] focus-visible:ring-[#153a75]/40";

const defaultValues: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues,
    mode: "onTouched",
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.resetPassword({ token, password: data.password });
      router.push(ROUTES.login);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#153a75] sm:text-4xl">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Create a new password for your account.
        </p>
      </header>

      <Card className="border-border/80 p-5 shadow-md sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              New Password
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
              Confirm New Password
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className={AUTH_BUTTON_CLASS}
          >
            {isSubmitting ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href={ROUTES.login}
          className="cursor-pointer font-medium text-[#153a75] transition-colors hover:text-primary-hover"
        >
          Back to Login
        </Link>
      </p>
    </div>
  );
}

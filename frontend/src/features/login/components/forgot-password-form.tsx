"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password-schema";

const AUTH_BUTTON_CLASS =
  "w-full cursor-pointer bg-[#153a75] text-white hover:bg-[#102b55] focus-visible:ring-[#153a75]/40";

const defaultValues: ForgotPasswordFormValues = {
  email: "",
};

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues,
    mode: "onTouched",
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authApi.forgotPassword(data.email);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#153a75] sm:text-4xl">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Enter the email address you used to register on our platform. We&apos;ll
          help you reset your password.
        </p>
      </header>

      <Card className="border-border/80 p-5 shadow-md sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-700" role="status">
              {success}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Registered Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className={AUTH_BUTTON_CLASS}
          >
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{" "}
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

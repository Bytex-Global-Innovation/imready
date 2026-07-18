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
import { loginSchema, type LoginFormValues } from "../schemas/login-schema";

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
  rememberMe: false,
};

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues,
    mode: "onTouched",
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);

    try {
      console.log("Login data:", data);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(ROUTES.dashboard);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#153a75] sm:text-4xl">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Log in to continue your career readiness journey.
        </p>
      </header>

      <Card className="border-border/80 p-5 shadow-md sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Email Address
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

          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded border-border text-foreground focus:ring-foreground/30"
                {...register("rememberMe")}
              />
              <span className="text-sm text-foreground">Remember me</span>
            </label>

            <Link
              href={ROUTES.forgotPassword}
              className="cursor-pointer font-medium text-[#153a75] transition-colors hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-[#153a75] text-white hover:bg-[#102b55] focus-visible:ring-[#153a75]/40"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.signupStep(1)}
          className="cursor-pointer font-medium text-[#153a75] transition-colors hover:text-primary-hover"
        >
          Apply Now
        </Link>
      </p>
    </div>
  );
}

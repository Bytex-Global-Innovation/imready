"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants";
import { RegistrationStepper } from "./registration-stepper";
import { PersonalInfoStep } from "./personal-info-step";
import { AcademicDetailsStep } from "./academic-details-step";
import { ChooseDoorStep } from "./choose-door-step";
import {
  signupSchema,
  STEP_FIELDS,
  type SignupFormValues,
} from "../schemas/signup-schemas";

const defaultValues: SignupFormValues = {
  fullName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  password: "",
  confirmPassword: "",
  college: "",
  streamMajor: "",
  graduationYear: "",
  targetDomain: "",
  careerDoor: "",
};

function ArrowForwardIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

function ArrowBackIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );
}

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema) as Resolver<SignupFormValues>,
    defaultValues,
    mode: "onTouched",
  });

  const selectedDoor = watch("careerDoor");
  const selectedDomain = watch("targetDomain");
  const isLastStep = currentStep === 3;

  async function handleContinue() {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function onSubmit(data: SignupFormValues) {
    setIsSubmitting(true);

    try {
      // Placeholder for API integration
      console.log("Signup data:", data);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Join IMReady
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Start your journey to career readiness.
        </p>
      </header>

      <div className="mb-8 px-2 sm:mb-10 sm:px-6">
        <RegistrationStepper currentStep={currentStep} />
      </div>

      <Card className="border-border/80 p-5 shadow-md sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {currentStep === 1 && (
            <PersonalInfoStep register={register} errors={errors} />
          )}
          {currentStep === 2 && (
            <AcademicDetailsStep
              register={register}
              errors={errors}
              selectedDomain={selectedDomain}
            />
          )}
          {currentStep === 3 && (
            <ChooseDoorStep
              register={register}
              errors={errors}
              selectedDoor={selectedDoor}
            />
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                <ArrowBackIcon />
                Back
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {isLastStep ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:ml-auto sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleContinue}
                className="w-full sm:ml-auto sm:w-auto"
              >
                Continue
                <ArrowForwardIcon />
              </Button>
            )}
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-foreground transition-colors hover:text-brand-700"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}

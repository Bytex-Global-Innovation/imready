"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES, type SignupStep } from "@/constants/routes";
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
  agreedToTerms: false,
};

/**
 * Each step (/signup/step/1, /2, /3) is a separate page route, so this
 * component fully unmounts and remounts between steps. We persist the
 * in-progress form data to sessionStorage so values from earlier steps
 * survive that navigation and are still present when the final step
 * validates and submits the whole form.
 */
const DRAFT_STORAGE_KEY = "imready-signup-draft";

function loadDraft(): Partial<SignupFormValues> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SignupFormValues>) : null;
  } catch {
    return null;
  }
}

function saveDraft(values: SignupFormValues) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Ignore storage failures (e.g. private browsing quota) — worst case
    // the person just has to re-enter earlier steps.
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}

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

interface SignupFormProps {
  step: SignupStep;
}

export function SignupForm({ step: currentStep }: SignupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema) as Resolver<SignupFormValues>,
    defaultValues: { ...defaultValues, ...loadDraft() },
    mode: "onTouched",
  });

  const selectedDoor = watch("careerDoor");
  const selectedDomain = watch("targetDomain");
  const agreedToTerms = watch("agreedToTerms");
  const watchedValues = watch();

  // Keep the draft in sync as the person types/selects, on every step.
  useEffect(() => {
    saveDraft(watchedValues);
  }, [watchedValues]);

  function goToStep(step: SignupStep) {
    router.push(ROUTES.signupStep(step), { scroll: false });
  }

  async function handleContinue() {
    const fields = STEP_FIELDS[currentStep];
    const isValid = await trigger(fields);

    if (isValid && currentStep < 3) {
      goToStep((currentStep + 1) as SignupStep);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as SignupStep);
    }
  }

  async function onSubmit(data: SignupFormValues) {
    setIsSubmitting(true);

    try {
      console.log("Signup data:", data);
      await new Promise((resolve) => setTimeout(resolve, 800));

      clearDraft();

      // Route students to the right place based on the door they chose.
      if (data.careerDoor === "bytex-unlock") {
        router.push(ROUTES.bytex);
      } else {
        router.push(ROUTES.dashboard);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Join ImReady
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
              agreedToTerms={agreedToTerms}
              setValue={setValue}
              isSubmitting={isSubmitting}
              onBack={handleBack}
            />
          )}

          {currentStep !== 3 && (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="w-full cursor-pointer sm:w-auto"
                >
                  <ArrowBackIcon />
                  Back
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}

              <Button
                type="button"
                onClick={handleContinue}
                className="w-full cursor-pointer sm:ml-auto bg-[#153a75] hover:bg-[#102b55]  sm:w-auto"
              >
                Continue
                <ArrowForwardIcon />
              </Button>
            </div>
          )}
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="cursor-pointer font-medium text-[#153a75] transition-colors hover:text-primary-hover"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
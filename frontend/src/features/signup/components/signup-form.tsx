"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES, type SignupStep } from "@/constants/routes";
import { authApi } from "@/lib/api";
import { RegistrationStepper } from "./registration-stepper";
import { PersonalInfoStep } from "./personal-info-step";
import { AcademicDetailsStep } from "./academic-details-step";
import { ChooseDoorStep } from "./choose-door-step";
import { SignupErrorModal } from "./signup-error-modal";
import {
  signupSchema,
  STEP_FIELDS,
  type SignupFormValues,
} from "../schemas/signup-schemas";

const SIGNUP_DRAFT_KEY = "imready_signup_draft";
const SIGNUP_STEP_KEY = "imready_signup_step";

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

function readDraft(): SignupFormValues {
  if (typeof window === "undefined") return defaultValues;
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return defaultValues;
    return { ...defaultValues, ...JSON.parse(raw) };
  } catch {
    return defaultValues;
  }
}

function readStep(): SignupStep {
  if (typeof window === "undefined") return 1;
  const raw = Number(window.sessionStorage.getItem(SIGNUP_STEP_KEY) || 1);
  return raw === 2 || raw === 3 ? raw : 1;
}

function writeDraft(values: SignupFormValues) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(values));
}

function writeStep(step: SignupStep) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIGNUP_STEP_KEY, String(step));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
  window.sessionStorage.removeItem(SIGNUP_STEP_KEY);
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

export function SignupForm() {
  const [ready, setReady] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(signupSchema) as Resolver<SignupFormValues>,
    defaultValues: { ...defaultValues, ...loadDraft() },
    mode: "onTouched",
  });

  useEffect(() => {
    reset(readDraft());
    setCurrentStep(readStep());
    setReady(true);
  }, [reset]);

  useEffect(() => {
    if (!ready) return;
    const subscription = watch((values) => {
      writeDraft(values as SignupFormValues);
    });
    return () => subscription.unsubscribe();
  }, [ready, watch]);

  const selectedDoor = watch("careerDoor");
  const selectedDomain = watch("targetDomain");
  const agreedToTerms = watch("agreedToTerms");
  const watchedValues = watch();

  // Keep the draft in sync as the person types/selects, on every step.
  useEffect(() => {
    saveDraft(watchedValues);
  }, [watchedValues]);

  function goToStep(step: SignupStep) {
    writeDraft(getValues());
    writeStep(step);
    setCurrentStep(step);
    setSubmitError(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    setSubmitError(null);

    try {
      const result = await authApi.signup({
        fullName: data.fullName,
        email: data.email,
        countryCode: data.countryCode,
        phone: data.phone,
        password: data.password,
        college: data.college,
        streamMajor: data.streamMajor,
        graduationYear: data.graduationYear,
        targetDomain: data.targetDomain,
        careerDoor: data.careerDoor,
        agreedToTerms: data.agreedToTerms,
      });

      clearDraft();
      setPendingEmail(result.email || data.email);
      setSuccessMessage(
        result.message ||
          "We've sent a verification email. Please check your inbox and click Verify within 1 hour.",
      );
    } catch (err) {
      setErrorPopup(
        err instanceof Error ? err.message : "Failed to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onInvalid() {
    const step1Ok = await trigger(STEP_FIELDS[1]);
    if (!step1Ok) {
      setSubmitError(
        "Please complete Personal Info (step 1) before creating your account.",
      );
      goToStep(1);
      return;
    }
    const step2Ok = await trigger(STEP_FIELDS[2]);
    if (!step2Ok) {
      setSubmitError(
        "Please complete Academic Details (step 2) before creating your account.",
      );
      goToStep(2);
      return;
    }
    setSubmitError(
      "Please fix the highlighted fields before creating your account.",
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-3xl py-16 text-center text-sm text-muted">
        Loading signup form…
      </div>
    );
  }

  if (pendingEmail) {
    return (
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#153a75]">
            Check your email
          </h1>
        </header>
        <Card className="space-y-4 border-border/80 p-6 text-center shadow-md">
          <p className="text-sm leading-relaxed text-muted">
            {successMessage ||
              "We've sent a verification email. Please check your inbox and click Verify."}
          </p>
          <p className="text-sm text-foreground">
            Sent to{" "}
            <span className="font-semibold text-[#153a75]">{pendingEmail}</span>
          </p>
          <p className="text-xs text-muted">
            The verification link expires in 1 hour. After that you&apos;ll need
            to sign up again.
          </p>
          <Button
            href={ROUTES.login}
            className="w-full bg-[#153a75] hover:bg-[#102b55]"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
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
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {submitError && (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

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
                className="w-full cursor-pointer sm:ml-auto bg-[#153a75] hover:bg-[#102b55] sm:w-auto"
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

      {errorPopup ? (
        <SignupErrorModal
          message={errorPopup}
          showLoginAction={/already exists/i.test(errorPopup)}
          onClose={() => setErrorPopup(null)}
        />
      ) : null}
    </div>
  );
}
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentProfile } from "@/components/auth/student-auth-gate";
import { ROUTES } from "@/constants/routes";
import {
  PREMIUM_PAYMENT,
  premiumQrImageUrl,
} from "@/constants/premium-payment";
import { ApiError, authApi, resolveMediaUrl } from "@/lib/api";

export function PremiumDetailsForm() {
  const router = useRouter();
  const { student, loading, refresh } = useStudentProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (loading || !student) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
        Loading your details…
      </div>
    );
  }

  const isPremium = student.subscriptionStatus === "PREMIUM";
  const alreadySubmitted = Boolean(student.premiumPaymentScreenshot);
  const submittedUrl = resolveMediaUrl(student.premiumPaymentScreenshot);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] || null;
    setError(null);
    setSuccess(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isPremium) {
      router.push(ROUTES.dashboard);
      return;
    }
    if (!file) {
      setError("Please upload a screenshot of your payment.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await authApi.submitPremiumPayment(file);
      setSuccess(result.message);
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not submit payment screenshot.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-10">
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          Premium plan
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#153a75]">
          Payment Details
        </h1>
        <p className="mt-2 text-sm text-muted">
          Scan the QR code, complete payment, then upload your screenshot for
          admin verification.
        </p>
      </header>

      <Card className="space-y-6 border-border/80 shadow-md">
        {isPremium ? (
          <div className="space-y-4 text-center">
            <p className="text-sm font-medium text-emerald-700">
              Premium is already active on your account.
            </p>
            <Button
              type="button"
              className="w-full bg-[#153a75] hover:bg-[#102b55]"
              onClick={() => router.push(ROUTES.dashboard)}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={student.studentName}
                readOnly
                className="bg-surface"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                value={student.email}
                readOnly
                className="bg-surface"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Input
                id="plan"
                value={PREMIUM_PAYMENT.planLabel}
                readOnly
                className="bg-surface font-semibold text-[#153a75]"
              />
            </div>

            <div className="rounded-[var(--radius-card)] border border-border bg-surface/60 p-4 text-center">
              <p className="text-sm font-semibold text-foreground">
                Pay ₹{PREMIUM_PAYMENT.amountInr}
              </p>
              <p className="mt-1 text-xs text-muted">
                UPI: {PREMIUM_PAYMENT.upiId}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={premiumQrImageUrl(220)}
                alt="Premium payment QR code"
                width={220}
                height={220}
                className="mx-auto mt-4 rounded-md border border-border bg-white p-2"
              />
              <p className="mt-3 text-xs text-muted">
                Scan with any UPI app, then upload the payment screenshot below.
              </p>
            </div>

            {alreadySubmitted && !file ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-medium">Screenshot already submitted</p>
                <p className="mt-1 text-xs">
                  Waiting for admin review. You can upload a new screenshot to
                  replace it.
                </p>
                {submittedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={submittedUrl}
                    alt="Submitted payment screenshot"
                    className="mt-3 max-h-40 rounded border border-amber-200 object-contain"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="screenshot" required>
                Payment Screenshot
              </Label>
              <input
                ref={fileRef}
                id="screenshot"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={onFileChange}
                className="block w-full cursor-pointer text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#153a75] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#102b55]"
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Selected payment screenshot preview"
                  className="mt-2 max-h-48 rounded border border-border object-contain"
                />
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? (
              <p className="text-sm text-emerald-700">{success}</p>
            ) : null}

            <div className="flex flex-col gap-3 pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#153a75] hover:bg-[#102b55]"
              >
                {isSubmitting
                  ? "Submitting…"
                  : alreadySubmitted
                    ? "Resubmit Screenshot"
                    : "Submit"}
              </Button>
              <button
                type="button"
                onClick={() => router.push(ROUTES.dashboard)}
                className="cursor-pointer text-sm font-medium text-muted hover:text-foreground"
              >
                Go to Dashboard
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

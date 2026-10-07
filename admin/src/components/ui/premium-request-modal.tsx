"use client";

import { useEffect, useId } from "react";
import { CheckCircle2, X } from "@/components/icons";
import type { Student } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/api";

interface PremiumRequestModalProps {
  open: boolean;
  student: Student | null;
  isLoading?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function PremiumRequestModal({
  open,
  student,
  isLoading = false,
  onClose,
  onApprove,
  onReject,
}: PremiumRequestModalProps) {
  const titleId = useId();
  const screenshotUrl = resolveMediaUrl(student?.premiumPaymentScreenshot);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isLoading, onClose]);

  if (!open || !student) return null;

  const submittedAt = student.premiumPaymentSubmittedAt
    ? new Date(student.premiumPaymentSubmittedAt).toLocaleString()
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close premium request dialog"
        disabled={isLoading}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                Premium plan request
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review the payment screenshot, then approve or reject access.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Close"
            disabled={isLoading}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <dl className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Student</dt>
            <dd className="font-medium text-gray-900">{student.studentName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Email</dt>
            <dd className="break-all text-right text-gray-900">{student.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Plan</dt>
            <dd className="font-semibold text-emerald-700">Premium</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Submitted</dt>
            <dd className="text-gray-900">{submittedAt || "Not submitted yet"}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Payment screenshot
          </p>
          {screenshotUrl ? (
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt={`Payment screenshot from ${student.studentName}`}
                className="mx-auto max-h-72 w-full object-contain"
              />
            </a>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-800">
              No payment screenshot uploaded yet. You can still reject the
              request, or wait for the student to submit proof.
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-btn-outline"
            disabled={isLoading}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="admin-btn-primary bg-red-600 hover:bg-red-700"
            disabled={isLoading}
            onClick={onReject}
          >
            {isLoading ? "Working…" : "Reject"}
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            disabled={isLoading || !screenshotUrl}
            title={
              screenshotUrl
                ? "Approve premium access"
                : "Screenshot required before approval"
            }
            onClick={onApprove}
          >
            {isLoading ? "Working…" : "Approve Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}

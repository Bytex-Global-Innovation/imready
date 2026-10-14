"use client";

import { useEffect, useId } from "react";
import { CheckCircle2, Trash2, X } from "@/components/icons";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  tone?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loadingLabel,
  tone = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId();
  const isPrimary = tone === "primary";

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isLoading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close confirmation dialog"
        disabled={isLoading}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isPrimary
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isPrimary ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
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

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-btn-outline"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              isPrimary
                ? "admin-btn-primary"
                : "admin-btn-primary bg-red-600 hover:bg-red-700"
            }
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading
              ? loadingLabel || (isPrimary ? "Approving…" : "Deleting…")
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

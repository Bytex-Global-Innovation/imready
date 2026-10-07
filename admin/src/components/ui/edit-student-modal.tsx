"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { X } from "@/components/icons";
import type { Student, SubscriptionStatus } from "@/lib/api";
import Select from "@/components/ui/select";

const DOMAIN_OPTIONS = [
  "Artificial Intelligence",
  "IoT",
  "Web Dev",
  "Product",
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

const SUBSCRIPTION_OPTIONS: {
  value: SubscriptionStatus;
  label: string;
}[] = [
  { value: "FREE", label: "Free" },
  { value: "PREMIUM_PENDING", label: "Premium Pending" },
  { value: "PREMIUM", label: "Premium" },
];

export type StudentEditPayload = {
  studentName: string;
  email: string;
  college: string;
  domain: string;
  level: string;
  phone?: string;
  subscriptionStatus: SubscriptionStatus;
};

interface EditStudentModalProps {
  open: boolean;
  student: Student | null;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (payload: StudentEditPayload) => void;
}

export default function EditStudentModal({
  open,
  student,
  isSaving = false,
  error,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const titleId = useId();
  const [form, setForm] = useState<StudentEditPayload>({
    studentName: "",
    email: "",
    college: "",
    domain: "",
    level: "Beginner",
    phone: "",
    subscriptionStatus: "FREE",
  });

  useEffect(() => {
    if (!open || !student) return;
    setForm({
      studentName: student.studentName || "",
      email: student.email || "",
      college: student.college || student.collegeName || "",
      domain: student.domain || "",
      level: student.level || "Beginner",
      phone: student.phone || "",
      subscriptionStatus: student.subscriptionStatus || "FREE",
    });
  }, [open, student]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isSaving, onClose]);

  if (!open || !student) return null;

  const domainOptions = DOMAIN_OPTIONS.includes(form.domain)
    ? DOMAIN_OPTIONS
    : form.domain
      ? [form.domain, ...DOMAIN_OPTIONS]
      : DOMAIN_OPTIONS;
  const levelOptions = LEVEL_OPTIONS.includes(form.level)
    ? LEVEL_OPTIONS
    : form.level
      ? [form.level, ...LEVEL_OPTIONS]
      : LEVEL_OPTIONS;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({
      studentName: form.studentName.trim(),
      email: form.email.trim(),
      college: form.college.trim(),
      domain: form.domain.trim(),
      level: form.level.trim(),
      phone: form.phone?.trim(),
      subscriptionStatus: form.subscriptionStatus,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close edit student dialog"
        disabled={isSaving}
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Edit student
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update profile details for {student.studentName}.
            </p>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Close"
            disabled={isSaving}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">Student name</span>
            <input
              className="admin-input w-full"
              value={form.studentName}
              onChange={(e) => setForm((prev) => ({ ...prev, studentName: e.target.value }))}
              required
              minLength={2}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">Email</span>
            <input
              type="email"
              className="admin-input w-full"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">College</span>
            <input
              className="admin-input w-full"
              value={form.college}
              onChange={(e) => setForm((prev) => ({ ...prev, college: e.target.value }))}
              required
              minLength={2}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Domain</span>
            <Select
              value={form.domain}
              onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))}
              required
            >
              {domainOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Level</span>
            <Select
              value={form.level}
              onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
              required
            >
              {levelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-gray-700">
              Subscription status
            </span>
            <Select
              value={form.subscriptionStatus}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  subscriptionStatus: e.target.value as SubscriptionStatus,
                }))
              }
              required
            >
              {SUBSCRIPTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-gray-500">
              Setting Premium unlocks premium features. Free moves the student
              back to the free plan.
            </p>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-btn-outline"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="admin-btn-primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

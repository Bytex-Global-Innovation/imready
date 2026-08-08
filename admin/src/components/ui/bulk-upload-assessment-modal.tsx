"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Download, Upload, X } from "@/components/icons";
import { assessmentsApi } from "@/lib/api";

interface BulkUploadAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadAssessmentModal({
  open,
  onClose,
  onSuccess,
}: BulkUploadAssessmentModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    { row?: number; field?: string; message: string }[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setError(null);
      setValidationErrors([]);
      setSuccessMessage(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [open]);

  if (!open) return null;

  async function handleDownloadSample() {
    setIsDownloading(true);
    setError(null);
    try {
      await assessmentsApi.downloadBulkSample();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download sample file.");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose an Excel file to upload.");
      return;
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setError("Only Excel files (.xlsx, .xls) are allowed.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    try {
      const result = await assessmentsApi.bulkUpload(file);
      setSuccessMessage(
        `Successfully created ${result.createdCount} assessment${
          result.createdCount === 1 ? "" : "s"
        }.`,
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload Excel file.";
      setError(message);
      const maybeErrors = (err as Error & {
        errors?: { row?: number; field?: string; message: string }[];
      }).errors;
      if (Array.isArray(maybeErrors)) {
        setValidationErrors(maybeErrors);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close bulk upload modal"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              Bulk upload assessments
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Download the sample Excel, fill in questions and answers, then upload.
            </p>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-800">1. Download sample Excel</p>
            <p className="mt-1 text-xs text-gray-500">
              Includes an Instructions sheet and example rows with the required columns.
            </p>
            <button
              type="button"
              className="admin-btn-outline mt-3 gap-2"
              onClick={handleDownloadSample}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading…" : "Download sample Excel"}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-800">2. Upload filled Excel</p>
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: .xlsx, .xls · Max size 2 MB
            </p>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center transition-colors hover:border-[#153a75] hover:bg-blue-50/40">
              <Upload className="mb-2 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {file ? file.name : "Click to choose file"}
              </span>
              <span className="mt-1 text-xs text-gray-400">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "or drag and drop"}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <p className="mb-1 font-semibold">Validation details</p>
              <ul className="space-y-1">
                {validationErrors.map((item, index) => (
                  <li key={`${item.row}-${item.field}-${index}`}>
                    {item.row ? `Row ${item.row}` : "Row ?"}
                    {item.field ? ` · ${item.field}` : ""}: {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="admin-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="admin-btn-primary gap-2"
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

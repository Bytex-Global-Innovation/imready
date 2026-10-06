"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Download, Eye, X } from "@/components/icons";
import { resolveMediaUrl } from "@/lib/api";

export interface EvidencePreviewTarget {
  fileName: string;
  filePath: string | null;
  fileUrl?: string | null;
}

interface FoundationEvidencePreviewModalProps {
  open: boolean;
  evidence: EvidencePreviewTarget | null;
  onClose: () => void;
}

function getFileExtension(fileName: string | null | undefined): string {
  if (!fileName) return "";
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index + 1).toLowerCase() : "";
}

function buildOfficePreviewSrc(fileUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

function isLocalUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

export default function FoundationEvidencePreviewModal({
  open,
  evidence,
  onClose,
}: FoundationEvidencePreviewModalProps) {
  const titleId = useId();
  const fileUrl = resolveMediaUrl(evidence?.filePath || evidence?.fileUrl);
  const extension = getFileExtension(evidence?.fileName);
  const isPdf = extension === "pdf";
  const isWordDocument = extension === "doc" || extension === "docx";
  const useOfficeViewer = isWordDocument && !isLocalUrl(fileUrl);
  const officePreviewSrc = useMemo(
    () => (useOfficeViewer && fileUrl ? buildOfficePreviewSrc(fileUrl) : ""),
    [useOfficeViewer, fileUrl],
  );

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !fileUrl || useOfficeViewer) {
      setPreviewBlobUrl(null);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPreview() {
      setIsLoading(true);
      setLoadError(null);
      setPreviewBlobUrl(null);

      try {
        const response = await fetch(fileUrl, { credentials: "include" });
        if (!response.ok) {
          throw new Error("Could not load the evidence file.");
        }

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(objectUrl);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load the evidence file.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, fileUrl, useOfficeViewer]);

  if (!open || !evidence || !fileUrl) return null;

  const downloadHref = previewBlobUrl || fileUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close evidence preview"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#153a75]">
              <Eye className="h-4 w-4" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                View evidence
              </h2>
              <p className="mt-1 text-sm text-gray-500">{evidence.fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadHref}
              download={evidence.fileName || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-3 py-1.5 text-sm font-medium text-[#153a75] hover:bg-surface"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button type="button" className="admin-icon-btn" aria-label="Close" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex h-[min(72vh,760px)] items-center justify-center rounded-lg border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">Loading evidence preview…</p>
            </div>
          ) : loadError ? (
            <div className="flex h-[min(72vh,760px)] flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50 px-6 py-10 text-center">
              <p className="text-sm text-red-800">{loadError}</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-4 py-2 text-sm font-medium text-[#153a75] hover:bg-surface"
              >
                <Eye className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          ) : useOfficeViewer ? (
            <iframe
              title={`Evidence preview: ${evidence.fileName}`}
              src={officePreviewSrc}
              className="h-[min(72vh,760px)] w-full rounded-lg border border-gray-200 bg-white"
            />
          ) : isWordDocument && isLocalUrl(fileUrl) ? (
            <div className="flex h-[min(72vh,760px)] flex-col items-center justify-center rounded-lg border border-dashed border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-900">
                Inline Word preview is not available for local development URLs.
              </p>
              <a
                href={previewBlobUrl || fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-white px-4 py-2 text-sm font-medium text-[#153a75] hover:bg-surface"
              >
                <Eye className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          ) : previewBlobUrl && isPdf ? (
            <iframe
              title={`Evidence preview: ${evidence.fileName}`}
              src={previewBlobUrl}
              className="h-[min(72vh,760px)] w-full rounded-lg border border-gray-200 bg-white"
            />
          ) : previewBlobUrl ? (
            <iframe
              title={`Evidence preview: ${evidence.fileName}`}
              src={previewBlobUrl}
              className="h-[min(72vh,760px)] w-full rounded-lg border border-gray-200 bg-white"
            />
          ) : (
            <div className="flex h-[min(72vh,760px)] items-center justify-center rounded-lg border border-gray-200 bg-white">
              <p className="text-sm text-gray-500">No preview available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

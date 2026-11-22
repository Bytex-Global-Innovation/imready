"use client";

import { useCallback, useRef, useState } from "react";
import { foundationApi } from "@/lib/foundation-api";
import { hydrateFoundationProgress, type MissionRecord } from "../lib/mission-progress";
import {
  Check,
  Clock,
  FileText,
  Info,
  MapPin,
  Target,
  X,
} from "@/components/icons";
import { WhatsAppCommunityHeaderLink } from "@/components/layout/whatsapp-community";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MissionBreadcrumb({
  stageLabel,
  current,
}: {
  stageLabel: string;
  current: string;
}) {
  return (
    <p className="text-xs font-semibold tracking-wider text-muted uppercase">
      Journey <span className="mx-1 text-brand-100">/</span> {stageLabel}{" "}
      <span className="mx-1 text-brand-100">/</span> <span className="text-primary">{current}</span>
    </p>
  );
}

export function ActiveMissionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      {label.toUpperCase()}
    </span>
  );
}

export function MissionLayout({
  breadcrumb,
  badge,
  title,
  subtitle,
  headerRight,
  top,
  banner,
  main,
  sidebar,
}: {
  breadcrumb: React.ReactNode;
  badge: React.ReactNode;
  title: string;
  subtitle: string;
  headerRight?: React.ReactNode;
  /** Full-width strip below breadcrumb (e.g. horizontal quest map). */
  top?: React.ReactNode;
  /** Full-width highlight below the title (e.g. problem statement). */
  banner?: React.ReactNode;
  main: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">{breadcrumb}</div>
        <WhatsAppCommunityHeaderLink className="shrink-0" />
      </div>

      {top ? <div className="mt-4">{top}</div> : null}

      <div
        className="mt-5 flex flex-wrap items-start gap-4"
        style={{ rowGap: "1rem" }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          {badge}
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {subtitle}
          </p>
        </div>
        {headerRight ? (
          <div style={{ flex: "0 0 auto", width: "288px", maxWidth: "100%" }}>
            {headerRight}
          </div>
        ) : null}
      </div>

      {banner ? <div className="mt-5">{banner}</div> : null}

      <div
        className={cn(
          "mt-6 grid grid-cols-1 gap-6",
          sidebar ? "lg:grid-cols-3" : "",
        )}
      >
        <section className={cn("space-y-5", sidebar ? "lg:col-span-2" : "")}>
          {main}
        </section>
        {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
      </div>
    </div>
  );
}

export function SelectedProblemBanner({
  statementText,
  prominent = false,
  compact = false,
  tone = "amber",
}: {
  statementText: string | null;
  /** Larger, bolder treatment for the hero problem callout. */
  prominent?: boolean;
  compact?: boolean;
  /** `panel` matches white left-column cards; `amber` is the highlight callout. */
  tone?: "amber" | "panel";
}) {
  if (!statementText?.trim()) return null;
  const isPanel = tone === "panel";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border shadow-sm",
        isPanel
          ? "border-border bg-white"
          : "border-amber-300/80 bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50",
        compact ? "px-4 py-3.5" : prominent ? "px-5 py-5 sm:px-7 sm:py-6" : "p-4",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          isPanel ? "bg-primary" : "bg-amber-500",
        )}
      />
      <p
        className={cn(
          "font-bold tracking-[0.16em] uppercase",
          isPanel ? "text-primary" : "text-amber-800",
          prominent || compact ? "text-xs" : "text-[10px]",
        )}
      >
        Problem statement
      </p>
      <p
        className={cn(
          "mt-1.5 leading-snug",
          isPanel ? "text-foreground" : "text-amber-950",
          compact
            ? "font-display text-base font-bold sm:text-lg"
            : prominent
              ? "font-display text-xl font-bold sm:text-2xl"
              : "text-sm font-semibold",
        )}
      >
        &ldquo;{statementText}&rdquo;
      </p>
    </div>
  );
}

export function TipFromReady({ advisorLabel, quote }: { advisorLabel: string; quote: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          AI
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Tip from READY</p>
          <p className="text-[10px] font-semibold tracking-wider text-muted uppercase">
            {advisorLabel}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted italic">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}

export interface ChecklistItem {
  label: string;
  caption?: string;
  done: boolean;
}

export function TaskChecklist({
  items,
  title = "Your Task Checklist",
}: {
  items: ChecklistItem[];
  title?: string;
}) {
  const doneCount = items.filter((i) => i.done).length;
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
            doneCount === items.length ? "bg-surface text-primary" : "bg-surface text-muted",
          )}
        >
          {doneCount} / {items.length} Complete
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                item.done ? "bg-primary text-white" : "bg-brand-100 text-muted",
              )}
            >
              {item.done ? <Check className="h-3 w-3" /> : null}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", item.done ? "text-muted line-through" : "text-foreground")}>
                {item.label}
              </p>
              {item.caption ? <p className="text-xs text-muted">{item.caption}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MissionDetailsCard({
  estTime,
  target,
  location,
  title = "Objective Details",
}: {
  estTime: string;
  target: string;
  location?: string | null;
  title?: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
      <dl className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="flex shrink-0 items-center gap-1.5 text-muted">
            <Clock className="h-3.5 w-3.5" /> Est. Time
          </dt>
          <dd className="text-right font-medium text-foreground">{estTime}</dd>
        </div>
        {location ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex shrink-0 items-center gap-1.5 text-muted">
              <MapPin className="h-3.5 w-3.5" /> Location
            </dt>
            <dd className="text-right font-medium text-foreground">{location}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <dt className="flex shrink-0 items-center gap-1.5 text-muted">
            <Target className="h-3.5 w-3.5" /> Target
          </dt>
          <dd className="text-right font-medium text-foreground">{target}</dd>
        </div>
      </dl>
    </div>
  );
}

const EVIDENCE_DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);

export function isAllowedEvidenceFileName(fileName: string | null | undefined): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx");
}

export function isAllowedEvidenceFile(file: File): boolean {
  if (!isAllowedEvidenceFileName(file.name)) return false;
  if (!file.type) return true;
  return ALLOWED_EVIDENCE_MIME_TYPES.has(file.type);
}

export interface EvidenceValue {
  fileName: string | null;
  filePath: string | null;
  previewUrl: string | null;
}

export function PresentationVideoLinkField({
  value,
  onChange,
  label = "Presentation video link",
  helper = "Paste a YouTube or Google Drive link to your prototype or demo video.",
  placeholder = "https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view",
  error,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helper?: string;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
        {label}
      </label>
      <input
        type="url"
        inputMode="url"
        autoComplete="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={disabled}
        className={cn(
          "w-full rounded-[var(--radius-card)] border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-border focus:border-primary focus:ring-primary",
        )}
      />
      {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>
      ) : null}
    </div>
  );
}

export function EvidenceCapture({
  missionId,
  value,
  onChange,
  caption,
  captionLabel = "Short title / caption",
  captionHelper,
  onCaptionChange,
  uploadHelper = "Upload a PDF describing your evidence, along with Google Drive links to photos, videos, or recordings. Ensure all links have viewing access enabled.",
}: {
  missionId: number;
  value: EvidenceValue;
  onChange: (value: EvidenceValue) => void;
  caption?: string;
  captionLabel?: string;
  captionHelper?: string;
  uploadHelper?: string;
  onCaptionChange?: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!isAllowedEvidenceFile(file)) {
        setFileError("Only PDF or Word files are allowed (.pdf, .doc, .docx).");
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      setFileError(null);
      setIsUploading(true);
      try {
        const result = await foundationApi.uploadEvidence(missionId, file);
        onChange({
          fileName: result.evidence.fileName,
          filePath: result.evidence.filePath,
          previewUrl: null,
        });
        if (result.progress?.missions) {
          const missions: Record<number, MissionRecord> = {};
          Object.entries(result.progress.missions).forEach(([id, record]) => {
            missions[Number(id)] = {
              answers: record.answers ?? {},
              evidence: record.evidence
                ? {
                    fileName: record.evidence.fileName,
                    fileType: record.evidence.fileType,
                    filePath: record.evidence.filePath,
                    previewDataUrl: null,
                  }
                : null,
              completed: Boolean(record.completed),
              completedAt: record.completedAt ?? null,
              xpEarned: Number(record.xpEarned) || 0,
              updatedAt: record.updatedAt ?? Date.now(),
            };
          });
          hydrateFoundationProgress({
            missions,
            totalXp: result.progress.totalXp,
            completedCount: result.progress.completedCount,
            foundationComplete: result.progress.foundationComplete,
            foundationCompletedAt: result.progress.foundationCompletedAt,
            projectsUnlocked: result.progress.projectsUnlocked,
          });
        }
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Failed to upload evidence.");
        if (inputRef.current) inputRef.current.value = "";
      } finally {
        setIsUploading(false);
      }
    },
    [missionId, onChange],
  );

  function clearFile() {
    setFileError(null);
    onChange({ fileName: null, filePath: null, previewUrl: null });
    if (inputRef.current) inputRef.current.value = "";
  }

  const selectedFileName =
    value.fileName && isAllowedEvidenceFileName(value.fileName) ? value.fileName : null;

  return (
    <div>
      <div className="mt-1">
        {selectedFileName ? (
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{selectedFileName}</p>
              <p className="text-xs text-muted">
                {isUploading ? "Uploading evidence…" : "Evidence document uploaded"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              aria-label="Remove evidence document"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-white hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => !isUploading && inputRef.current?.click()}
            disabled={isUploading}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-border bg-surface px-4 py-10 text-sm text-muted hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-6 w-6" />
            {isUploading ? "Uploading evidence…" : "Upload evidence document"}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={EVIDENCE_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
          }}
        />
        <p className="mt-2 text-xs leading-relaxed text-muted">{uploadHelper}</p>
        {fileError ? (
          <p className="mt-2 text-xs text-red-600" role="alert">{fileError}</p>
        ) : null}
      </div>

      {onCaptionChange ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-muted uppercase">
            {captionLabel}
          </label>
          <input
            type="text"
            value={caption ?? ""}
            onChange={(event) => onCaptionChange(event.target.value)}
            className="w-full rounded-[var(--radius-card)] border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {captionHelper ? <p className="mt-1.5 text-xs text-muted">{captionHelper}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function AutosaveStatus({ wordCount }: { wordCount?: number }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted">
      <Info className="h-3.5 w-3.5 shrink-0" />
      Auto-saving draft...
      {typeof wordCount === "number" ? (
        <span className="ml-auto shrink-0">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      ) : null}
    </p>
  );
}

export function QuestionField({
  index,
  question,
  helper,
  placeholder,
  value,
  onChange,
  done,
  disabled = false,
  compact = false,
}: {
  index: number;
  question: string;
  helper?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  done: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn(compact ? "mb-0" : "mb-4 last:mb-0")}>
      <div className={cn(compact ? "mb-1" : "mb-1.5")}>
        <p className={cn("font-semibold text-foreground", compact ? "text-xs leading-snug" : "text-sm")}>
          Q{index} {question}
        </p>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={disabled}
        aria-invalid={false}
        data-done={done ? "true" : "false"}
        className={cn(
          "w-full rounded-[var(--radius-card)] border border-border bg-white text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80",
          compact ? "resize-none px-3 py-2" : "resize-y px-4 py-2.5",
        )}
      />
      {helper ? <p className="mt-1.5 text-xs text-muted">{helper}</p> : null}
    </div>
  );
}

export function MissionFooterNav({
  onPrevious,
  previousLabel = "Back",
  onSubmit,
  submitDisabled,
  isSubmitting,
  isSubmitted,
  onNext,
  nextLabel = "Next",
  flush = false,
}: {
  onPrevious: () => void;
  previousLabel?: string;
  onSubmit: () => void | Promise<void>;
  submitDisabled?: boolean;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  /** Remove top margin/border when the parent already provides a footer chrome. */
  flush?: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function confirmSubmit() {
    setConfirmOpen(false);
    await onSubmit();
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between",
          flush ? "" : "mt-6 border-t border-border pt-5",
        )}
      >
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onPrevious}
          className="w-full sm:w-auto"
        >
          <span aria-hidden className="text-base leading-none">
            ←
          </span>
          {previousLabel}
        </Button>

        {isSubmitted ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-brand-100 bg-surface px-4 text-sm font-medium text-primary">
              <Check className="h-4 w-4 shrink-0" />
              Submitted
            </span>
            {onNext ? (
              <Button type="button" size="md" onClick={onNext} className="w-full sm:min-w-[11rem] sm:w-auto">
                {nextLabel}
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </Button>
            ) : null}
          </div>
        ) : (
          <Button
            type="button"
            size="md"
            onClick={() => setConfirmOpen(true)}
            disabled={submitDisabled || isSubmitting}
            className="w-full sm:min-w-[11rem] sm:w-auto"
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        )}
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-submit-confirm-title"
        >
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-xl sm:p-6">
            <h3
              id="mission-submit-confirm-title"
              className="font-display text-lg font-bold text-foreground"
            >
              Submit this stage?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Once you submit, you will not be able to edit your answers for this stage.
              Continue only if you are sure.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void confirmSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Yes, submit"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
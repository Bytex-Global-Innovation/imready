"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Info,
  TableProperties,
  Wifi,
  X,
  Zap,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ASSESSMENT_NOTICES, ASSESSMENT_PARTS } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";

interface AssessmentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssessmentInstructionsModal({
  isOpen,
  onClose,
}: AssessmentInstructionsModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleStart() {
    onClose();
    router.push(ROUTES.assessment);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-instructions-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id="assessment-instructions-title"
            className="font-display text-xl font-bold text-foreground sm:text-2xl"
          >
            Stage 0 Assessment Instructions
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex shrink-0 cursor-pointer rounded-md p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex gap-3 rounded-[var(--radius-card)] border border-brand-100 border-l-4 border-l-primary bg-surface px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            This assessment evaluates your creative baseline and helps us tailor
            the upcoming Explorer modules to your strengths.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TableProperties className="h-4 w-4 text-primary" />
            Key Instructions
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ASSESSMENT_PARTS.map((part) => (
              <div
                key={part.part}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-4"
              >
                <p className="text-sm font-bold text-foreground">{part.part}</p>
                <p className="mt-1 text-sm text-muted">{part.title}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {part.duration}
                </p>
              </div>
            ))}
          </div>
        </div>

        <ul className="mb-7 space-y-3">
          {ASSESSMENT_NOTICES.map((notice) => {
            const Icon =
              notice.icon === "clock"
                ? Clock
                : notice.icon === "wifi"
                  ? Wifi
                  : AlertTriangle;
            return (
              <li key={notice.id} className="flex gap-3 text-sm text-foreground">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  {notice.text}
                  {notice.highlight ? (
                    <>
                      {" "}
                      <span className="font-medium text-red-600">
                        {notice.highlight}
                      </span>
                    </>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} className="sm:min-w-[120px]">
            Go Back
          </Button>
          <Button onClick={handleStart} className="sm:min-w-[200px]">
            <Zap className="h-4 w-4" />
            I&apos;m Ready, Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ChevronRight, Info, Star, Wifi, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  FOUNDATION_INSTRUCTIONS,
  FOUNDATION_NOTICES,
  FOUNDATION_PARTS,
  type FoundationNoticeIcon,
} from "@/constants/dashboard";
import type { FoundationStageFrameworkPart } from "@/lib/foundation-api";
import { cn } from "@/lib/utils";

const NOTICE_ICONS: Record<FoundationNoticeIcon, typeof Wifi> = {
  wifi: Wifi,
  star: Star,
};

/** One entry per part, same order as FOUNDATION_PARTS. Full class names so Tailwind picks them up. */
const PART_STYLES = [
  {
    card: "border-amber-100 border-t-amber-400 bg-amber-50/60",
    pill: "bg-amber-100 text-amber-800",
    subtitle: "text-amber-800",
  },
  {
    card: "border-sky-100 border-t-sky-400 bg-sky-50/60",
    pill: "bg-sky-100 text-sky-800",
    subtitle: "text-sky-700",
  },
  {
    card: "border-indigo-100 border-t-indigo-400 bg-indigo-50/60",
    pill: "bg-indigo-100 text-indigo-800",
    subtitle: "text-indigo-700",
  },
  {
    card: "border-emerald-100 border-t-emerald-400 bg-emerald-50/60",
    pill: "bg-emerald-100 text-emerald-800",
    subtitle: "text-emerald-700",
  },
  {
    card: "border-rose-100 border-t-rose-400 bg-rose-50/60",
    pill: "bg-rose-100 text-rose-800",
    subtitle: "text-rose-700",
  },
] as const;

interface IndustryFrameworkModalProps {
  onClose: () => void;
  onNext: () => void;
  parts?: FoundationStageFrameworkPart[];
}

/**
 * Merged Foundation intro: industry READY overview + stage instructions
 * in one compact viewport (no scroll required on typical desktop heights).
 */
export function IndustryFrameworkModal({
  onClose,
  onNext,
  parts,
}: IndustryFrameworkModalProps) {
  const frameworkParts =
    parts && parts.length > 0 ? parts : ([...FOUNDATION_PARTS] as FoundationStageFrameworkPart[]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-3 backdrop-blur-[2px] sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="foundation-intro-title"
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3 sm:px-6 sm:py-3.5">
          <div>
            <h2
              id="foundation-intro-title"
              className="font-display text-lg font-bold text-foreground sm:text-xl"
            >
              {FOUNDATION_INSTRUCTIONS.title}
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
              The <span className="text-primary">R·E·A·D·Y</span> industry readiness framework
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex shrink-0 cursor-pointer rounded-md p-1 text-muted hover:bg-surface hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex gap-3 rounded-[var(--radius-card)] border border-brand-100 border-l-4 border-l-primary bg-surface px-3.5 py-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm leading-snug text-foreground">
              {FOUNDATION_INSTRUCTIONS.intro} Each stage builds one of the 5 skills companies look
              for.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {frameworkParts.map((part, index) => {
              const style = PART_STYLES[index] || PART_STYLES[0];
              return (
                <div
                  key={part.part}
                  className={cn(
                    "rounded-[var(--radius-card)] border border-t-4 p-3",
                    style.card,
                  )}
                >
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold",
                      style.pill,
                    )}
                  >
                    {part.letter}
                  </span>
                  <p className="mt-2 text-sm font-bold text-foreground">{part.title}</p>
                  <p className={cn("mt-0.5 text-[11px] font-medium leading-snug", style.subtitle)}>
                    {part.subtitle}
                  </p>
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-muted">
                    {part.description}
                  </p>
                </div>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5">
            {FOUNDATION_NOTICES.map((notice) => {
              const Icon = NOTICE_ICONS[notice.icon];
              return (
                <li
                  key={notice.id}
                  className="flex flex-1 items-start gap-2 text-xs text-foreground"
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      notice.icon === "star" ? "text-amber-500" : "text-muted",
                    )}
                  />
                  <p>
                    {notice.segments.map((segment, index) =>
                      segment.bold ? (
                        <span key={index} className="font-semibold">
                          {segment.text}
                        </span>
                      ) : (
                        <span key={index}>{segment.text}</span>
                      ),
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-surface/60 px-5 py-3.5 sm:px-6">
          <Button variant="secondary" onClick={onClose} className="sm:min-w-[110px]">
            Go Back
          </Button>
          <Button onClick={onNext} className="sm:min-w-[110px]">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

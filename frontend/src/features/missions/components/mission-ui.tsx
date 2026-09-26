"use client";

import { useCallback, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Mic,
  StickyNote,
  Target,
  Video,
  X,
} from "@/components/icons";
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
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold whitespace-nowrap text-emerald-700">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
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
  main,
  sidebar,
}: {
  breadcrumb: React.ReactNode;
  badge: React.ReactNode;
  title: string;
  subtitle: string;
  headerRight?: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      {breadcrumb}
      <div
        className="mt-4 flex flex-wrap items-start gap-4"
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">{main}</section>
        <aside className="space-y-4">{sidebar}</aside>
      </div>
    </div>
  );
}

export function MissionProgressPanel({
  label,
  stepLabel,
  percent,
  nextLabel,
}: {
  label: string;
  stepLabel: string;
  percent: number;
  nextLabel?: string;
}) 
{
  return (
    <div className="w-full rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wider text-muted uppercase">
        <span className="whitespace-nowrap">{label}</span>
        <span className="whitespace-nowrap text-foreground">{stepLabel}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      {nextLabel ? <p className="mt-1.5 text-right text-xs text-muted">Next: {nextLabel}</p> : null}
    </div>
  );
}

export function TipFromReady({ advisorLabel, quote }: { advisorLabel: string; quote: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          AI
        </span>
        <p className="text-sm font-semibold text-foreground">Tip from READY</p>
        <span className="ml-auto shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted uppercase">
          {advisorLabel}
        </span>
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
            doneCount === items.length ? "bg-emerald-50 text-emerald-700" : "bg-surface text-muted",
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
                item.done ? "bg-emerald-500 text-white" : "bg-brand-100 text-muted",
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
  title = "Mission Details",
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

export type CaptureMethod = "photo" | "note" | "voice" | "video";

const METHOD_ICONS: Record<CaptureMethod, typeof Camera> = {
  photo: Camera,
  note: StickyNote,
  voice: Mic,
  video: Video,
};

const METHOD_LABELS: Record<CaptureMethod, string> = {
  photo: "Photo",
  note: "Note",
  voice: "Voice",
  video: "Video",
};

export interface EvidenceValue {
  fileName: string | null;
  previewUrl: string | null;
}

export function EvidenceCapture({
  methods,
  value,
  onChange,
  caption,
  captionLabel = "Short title / caption",
  captionHelper,
  onCaptionChange,
}: {
  methods: CaptureMethod[];
  value: EvidenceValue;
  onChange: (value: EvidenceValue) => void;
  caption?: string;
  captionLabel?: string;
  captionHelper?: string;
  onCaptionChange?: (value: string) => void;
}) {
  const [active, setActive] = useState<CaptureMethod>(methods[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMedia = active === "photo" || active === "video";

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      onChange({ fileName: file.name, previewUrl: URL.createObjectURL(file) });
    },
    [onChange],
  );

  return (
    <div>
      <div className="flex gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-1">
        {methods.map((method) => {
          const Icon = METHOD_ICONS[method];
          const isActive = active === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => setActive(method)}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-button)] py-2 text-sm font-medium transition-colors",
                isActive ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {METHOD_LABELS[method]}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {isMedia ? (
          value.previewUrl ? (
            <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-border">
              {active === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.previewUrl} alt={value.fileName ?? "Uploaded evidence"} className="max-h-64 w-full object-cover" />
              ) : (
                <video src={value.previewUrl} className="max-h-64 w-full" controls />
              )}
              <button
                type="button"
                onClick={() => onChange({ fileName: null, previewUrl: null })}
                aria-label="Remove evidence"
                className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="absolute right-0 bottom-0 left-0 truncate bg-foreground/60 px-3 py-1.5 text-xs text-white">
                {value.fileName}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-border bg-surface py-10 text-sm text-muted hover:border-primary hover:text-primary"
            >
              <Camera className="h-6 w-6" />
              Upload {METHOD_LABELS[active].toLowerCase()} evidence
            </button>
          )
        ) : (
          <textarea
            value={value.fileName ?? ""}
            onChange={(event) => onChange({ fileName: event.target.value, previewUrl: null })}
            rows={4}
            placeholder={active === "voice" ? "Type a transcript of what you recorded..." : "Type your note here..."}
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept={active === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
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
  value,
  onChange,
  done,
}: {
  index: number;
  question: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  done: boolean;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          Q{index} {question}
        </p>
        {done ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : null}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-2.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {helper ? <p className="mt-1.5 text-xs text-muted">{helper}</p> : null}
    </div>
  );
}

export function MissionFooterNav({
  onPrevious,
  previousLabel = "Previous Mission",
  onSaveDraft,
  onNext,
  nextLabel,
  nextDisabled,
  isSubmitting,
}: {
  onPrevious: () => void;
  previousLabel?: string;
  onSaveDraft: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" onClick={onPrevious} className="cursor-pointer text-sm font-medium text-muted hover:text-foreground">
        ← {previousLabel}
      </button>
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button size="sm" onClick={onNext} disabled={nextDisabled || isSubmitting} className="min-w-[180px]">
          {isSubmitting ? "Saving..." : nextLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
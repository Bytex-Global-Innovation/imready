"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Star, TableProperties, Wifi, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IndustryFrameworkModal } from "./industry-framework-modal";
import {
  FOUNDATION_INSTRUCTIONS,
  FOUNDATION_NOTICES,
  FOUNDATION_PARTS,
  FOUNDATION_PROBLEM_STATEMENTS,
  type FoundationNoticeIcon,
} from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import {
  getSelectedProblemStatement,
  setSelectedProblemStatement,
} from "@/features/missions/lib/problem-statement";
import { cn } from "@/lib/utils";

interface AssessmentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTICE_ICONS: Record<FoundationNoticeIcon, typeof Wifi> = {
  wifi: Wifi,
  star: Star,
};

/** One entry per part, same order as FOUNDATION_PARTS. Full class names so Tailwind picks them up. */
const PART_STYLES = [
  { card: "border-amber-100 border-t-amber-400 bg-amber-50/60", pill: "bg-amber-100 text-amber-800", subtitle: "text-amber-800" },
  { card: "border-sky-100 border-t-sky-400 bg-sky-50/60", pill: "bg-sky-100 text-sky-800", subtitle: "text-sky-700" },
  { card: "border-indigo-100 border-t-indigo-400 bg-indigo-50/60", pill: "bg-indigo-100 text-indigo-800", subtitle: "text-indigo-700" },
  { card: "border-emerald-100 border-t-emerald-400 bg-emerald-50/60", pill: "bg-emerald-100 text-emerald-800", subtitle: "text-emerald-700" },
  { card: "border-rose-100 border-t-rose-400 bg-rose-50/60", pill: "bg-rose-100 text-rose-800", subtitle: "text-rose-700" },
] as const;

export function AssessmentInstructionsModal({
  isOpen,
  onClose,
}: AssessmentInstructionsModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<"framework" | "instructions">("framework");

  // Restore a previously saved choice whenever the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setStep("framework");
    setSelectedId(getSelectedProblemStatement()?.id ?? null);
  }, [isOpen]);

  if (!isOpen) return null;
  if (step === "framework") {
  return <IndustryFrameworkModal onClose={onClose} onNext={() => setStep("instructions")} />;
}

  function handleStart() {
    if (!selectedId) return;
    setSelectedProblemStatement(selectedId);
    onClose();
    router.push(ROUTES.assessment);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="foundation-instructions-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <h2
            id="foundation-instructions-title"
            className="font-display text-xl font-bold text-foreground sm:text-2xl"
          >
            {FOUNDATION_INSTRUCTIONS.title}
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

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-6 flex gap-3 rounded-[var(--radius-card)] border border-brand-100 border-l-4 border-l-primary bg-surface px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {FOUNDATION_INSTRUCTIONS.intro}
            </p>
          </div>

          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <TableProperties className="h-4 w-4 text-primary" />
              Know the industry readiness framework
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {FOUNDATION_PARTS.map((part, index) => {
                const style = PART_STYLES[index];
                return (
                  <div
                    key={part.part}
                    className={cn(
                      "rounded-[var(--radius-card)] border border-t-4 p-3.5",
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
                    <p className="mt-2.5 text-sm font-bold text-foreground">{part.title}</p>
                    <p className={cn("mt-1 text-xs font-medium", style.subtitle)}>
                      {part.subtitle}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-muted">
                      {part.description}
                    </p>
                    <div className="mt-3 border-t border-black/5" aria-hidden />
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="mb-6 space-y-2">
            {FOUNDATION_NOTICES.map((notice) => {
              const Icon = NOTICE_ICONS[notice.icon];
              return (
                <li key={notice.id} className="flex items-center gap-2.5 text-xs text-foreground">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
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

          <div className="border-t border-border pt-5">
            <h3 className="font-display text-base font-bold text-foreground">
              Choose Your Foundation Problem Statement
            </h3>
            <p className="mt-1 text-xs text-primary">
              Select one campus challenge to investigate across all 5 stages:
            </p>

            <div
              role="radiogroup"
              aria-label="Foundation problem statement"
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {FOUNDATION_PROBLEM_STATEMENTS.map((problem) => {
                const selected = selectedId === problem.id;
                return (
                  <button
                    key={problem.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedId(problem.id)}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 px-4 py-3.5 text-left text-xs leading-relaxed font-medium text-foreground transition-colors",
                      selected
                        ? "border-primary bg-white shadow-sm"
                        : "border-transparent bg-surface hover:border-brand-100",
                    )}
                  >
                    {problem.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs text-muted">
            {selectedId ? "" : "Select a problem statement to continue."}
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
           <Button variant="secondary" onClick={() => setStep("framework")} className="sm:min-w-[110px]">
  Go Back
</Button>
            <Button onClick={handleStart} disabled={!selectedId} className="sm:min-w-[190px]">
             
              I&apos;m Ready, Let&apos;s Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
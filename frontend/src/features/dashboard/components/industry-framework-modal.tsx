"use client";

import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  FileText,
  Info,
  LayoutDashboard,
  MessageSquare,
  TrendingUp,
  Users,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPETENCIES = [
  {
    letter: "R",
    name: "Reality",
    title: "Understand real user needs",
    detail: "Research, Empathy, User Observation",
    icon: Users,
    nameClass: "text-red-600",
    tileClass: "bg-blue-50 text-blue-700",
    badgeClass: "bg-red-600",
  },
  {
    letter: "E",
    name: "Engage",
    title: "Communication & Stakeholder Management",
    detail: "Test communication, persuasion & collaborative alignment",
    icon: MessageSquare,
    nameClass: "text-emerald-600",
    tileClass: "bg-emerald-50 text-emerald-600",
    badgeClass: "bg-emerald-600",
  },
  {
    letter: "A",
    name: "Analyze",
    title: "Analytical thinking",
    detail: "Structured problem solving & root-cause decomposition (The 5 Whys)",
    icon: BarChart3,
    nameClass: "text-amber-600",
    tileClass: "bg-amber-50 text-amber-600",
    badgeClass: "bg-amber-500",
  },
  {
    letter: "D",
    name: "Do",
    title: "Execution & Experimentation",
    detail: "Hands-on skills, practical prototyping & rapid testing",
    icon: LayoutDashboard,
    nameClass: "text-blue-600",
    tileClass: "bg-indigo-50 text-indigo-600",
    badgeClass: "bg-blue-600",
  },
  {
    letter: "Y",
    name: "Your Proof",
    title: "Show impact",
    detail: "Portfolio demonstration, verified evidence & outcome storytelling",
    icon: TrendingUp,
    nameClass: "text-orange-600",
    tileClass: "bg-orange-50 text-orange-600",
    badgeClass: "bg-orange-500",
  },
] as const;

interface IndustryFrameworkModalProps {
  onClose: () => void;
  onNext: () => void;
}

export function IndustryFrameworkModal({ onClose, onNext }: IndustryFrameworkModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="industry-framework-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <h2
            id="industry-framework-title"
            className="font-display text-xl font-bold text-foreground sm:text-2xl"
          >
            Know the Industry Readiness Framework
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
          <div className="flex gap-3 rounded-[var(--radius-card)] border border-brand-100 bg-surface px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              Before diving into the foundational missions, explore the core competencies that top
              companies look for. Each stage in your journey builds and validates one of these 5
              crucial industry skills.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <FileText className="h-4 w-4 text-muted" />
              What industry looks for
            </h3>
            <p className="mt-1 text-[10px] font-semibold tracking-wider text-muted uppercase">
              The <span className="text-primary">R·E·A·D·Y</span> competencies (Reality • Engage •
              Analyze • Do • Your Proof)
            </p>
          </div>

          <ul className="mt-4 space-y-3">
            {COMPETENCIES.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.letter}
                  className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-3.5 shadow-sm"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      item.tileClass,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className={cn("font-bold", item.nameClass)}>{item.name}</span>
                      {" — "}
                      <span className="font-semibold">{item.title}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">{item.detail}</p>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted sm:block" />
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                      item.badgeClass,
                    )}
                  >
                    {item.letter}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 rounded-[var(--radius-card)] border border-amber-100 bg-amber-50/60 px-4 py-3 text-center text-xs text-muted italic">
            &ldquo;These are the same skills used in real product, business and innovation roles
            across industries.&rdquo;
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-surface/60 px-5 py-4 sm:px-7">
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
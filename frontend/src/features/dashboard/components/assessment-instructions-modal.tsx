"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { IndustryFrameworkModal } from "./industry-framework-modal";
import { FOUNDATION_PARTS } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import {
  clearFoundationJourneyCache,
  setFoundationJourneyCache,
} from "@/features/missions/lib/foundation-journey";
import {
  ensureFoundationProgress,
  invalidateFoundationProgressCache,
} from "@/features/missions/lib/mission-progress";
import {
  FoundationApiError,
  foundationApi,
  type FoundationProblemStatement,
  type FoundationStageFrameworkPart,
} from "@/lib/foundation-api";
import { cn } from "@/lib/utils";

interface AssessmentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssessmentInstructionsModal({
  isOpen,
  onClose,
}: AssessmentInstructionsModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<"intro" | "problem">("intro");
  const [problemOptions, setProblemOptions] = useState<FoundationProblemStatement[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [frameworkParts, setFrameworkParts] = useState<FoundationStageFrameworkPart[]>(
    () => [...FOUNDATION_PARTS],
  );

  useEffect(() => {
    if (!isOpen) return;
    setStep("intro");
    setProblemsError(null);
    setSelectedId(null);
    setFrameworkParts([...FOUNDATION_PARTS]);
  }, [isOpen]);

  // Prefetch problems + framework while the intro step is open so step 2 is ready.
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setProblemsLoading(true);
    setProblemsError(null);

    (async () => {
      try {
        const [progress, { problemStatements }, framework] = await Promise.all([
          ensureFoundationProgress(),
          foundationApi.listProblemStatements(),
          foundationApi.getStageFramework(),
        ]);
        if (cancelled) return;
        if (framework.parts.length > 0) {
          setFrameworkParts(framework.parts);
        }
        setProblemOptions(problemStatements);
        const existing =
          progress.selectedProblemStatement?.id ??
          progress.foundationProblemStatementId ??
          null;
        // Default: existing selection, otherwise first statement.
        if (existing) {
          setSelectedId(existing);
        } else if (problemStatements[0]) {
          setSelectedId(problemStatements[0].id);
        }
      } catch {
        if (!cancelled) {
          setProblemsError("Could not load problem statements. Please try again.");
        }
      } finally {
        if (!cancelled) setProblemsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (step === "intro") {
    return (
      <IndustryFrameworkModal
        onClose={onClose}
        onNext={() => setStep("problem")}
        parts={frameworkParts}
      />
    );
  }

  async function handleStart() {
    if (!selectedId || isSaving) return;
    setIsSaving(true);
    setProblemsError(null);
    try {
      clearFoundationJourneyCache();
      invalidateFoundationProgressCache();
      const journey = await foundationApi.selectProblemStatement(selectedId);
      setFoundationJourneyCache(journey);
      invalidateFoundationProgressCache();
      await ensureFoundationProgress();
      onClose();
      router.push(ROUTES.assessment);
    } catch (err) {
      const message =
        err instanceof FoundationApiError
          ? err.message
          : "Could not save your selection. Please try again.";
      setProblemsError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-3 backdrop-blur-[2px] sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="foundation-problem-title"
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5 sm:px-6">
          <div>
            <h2
              id="foundation-problem-title"
              className="font-display text-lg font-bold text-foreground sm:text-xl"
            >
              Choose Your Foundation Problem Statement
            </h2>
            <p className="mt-1 text-xs text-primary">
              Select one campus challenge to investigate across all 5 stages:
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

        <div className="px-5 py-5 sm:px-6">
          {problemsError ? (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {problemsError}
            </p>
          ) : null}
          {problemsLoading ? (
            <p className="text-sm text-muted">Loading problem statements…</p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Foundation problem statement"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {problemOptions.map((problem) => {
                const selected = selectedId === problem.id;
                return (
                  <button
                    key={problem.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedId(problem.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors",
                      selected
                        ? "border-primary bg-white shadow-sm"
                        : "border-transparent bg-surface hover:border-brand-100",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        selected
                          ? "border-primary bg-primary"
                          : "border-[#c3c6d0] bg-white",
                      )}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span className="text-sm leading-relaxed font-medium text-foreground">
                      {problem.statementText}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Button
            variant="secondary"
            onClick={() => setStep("intro")}
            className="sm:min-w-[110px]"
          >
            Go Back
          </Button>
          <Button
            onClick={() => void handleStart()}
            disabled={!selectedId || isSaving || problemsLoading || problemOptions.length === 0}
            className="sm:min-w-[190px]"
          >
            {isSaving ? "Saving…" : "I'm Ready, Let's Start"}
          </Button>
        </div>
      </div>
    </div>
  );
}

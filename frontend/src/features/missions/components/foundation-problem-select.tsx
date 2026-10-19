"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { foundationApi, type FoundationProblemStatement } from "@/lib/foundation-api";
import { cn } from "@/lib/utils";
import {
  clearFoundationJourneyCache,
  ensureFoundationJourneyContent,
} from "../lib/foundation-journey";
import {
  ensureFoundationProgress,
  invalidateFoundationProgressCache,
} from "../lib/mission-progress";

export function FoundationProblemSelect() {
  const router = useRouter();
  const [options, setOptions] = useState<FoundationProblemStatement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureFoundationProgress();
        const [{ problemStatements }, journey] = await Promise.all([
          foundationApi.listProblemStatements(),
          ensureFoundationJourneyContent(),
        ]);
        if (cancelled) return;
        setOptions(problemStatements);
        if (journey.selectedProblemStatement?.id) {
          setSelectedId(journey.selectedProblemStatement.id);
        } else if (problemStatements[0]) {
          setSelectedId(problemStatements[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load problem statements.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleContinue() {
    if (!selectedId || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      clearFoundationJourneyCache();
      invalidateFoundationProgressCache();
      await foundationApi.selectProblemStatement(selectedId);
      await ensureFoundationProgress();
      await ensureFoundationJourneyContent();
      router.replace(ROUTES.mission(1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your selection.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted">Loading foundation setup…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Choose Your Foundation Problem Statement
      </h1>
      <p className="mt-2 text-sm text-muted sm:text-base">
        Select one campus challenge to investigate across all 5 stages:
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              className={cn(
                "rounded-[var(--radius-card)] border p-4 text-left text-sm leading-relaxed transition-colors",
                isSelected
                  ? "border-primary bg-white shadow-sm"
                  : "border-border bg-surface/60 text-foreground hover:border-primary/40",
              )}
            >
              {option.statementText}
            </button>
          );
        })}
      </div>

      {options.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No problem statements are available yet. Please check back later.
        </p>
      ) : (
        <div className="mt-8 flex justify-end">
          <Button onClick={handleContinue} disabled={!selectedId || isSaving}>
            {isSaving ? "Saving…" : "Continue to Mission 1"}
          </Button>
        </div>
      )}
    </div>
  );
}

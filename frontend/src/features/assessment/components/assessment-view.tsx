"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Info,
  Lightbulb,
  Send,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { RearrangeableOptions } from "@/features/assessment/components/rearrangeable-options";
import {
  clearAssessmentDraft,
  loadAssessmentDraft,
  saveAssessmentDraft,
} from "@/features/assessment/lib/assessment-draft";
import {
  assessmentApi,
  type ActiveAssessment,
  type AssessmentQuestion,
} from "@/lib/api";

function countWords(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function defaultOrderFor(question: AssessmentQuestion) {
  return question.options.map((option) => option.id);
}

function needsJumbled(answerType: AssessmentQuestion["answerType"] | undefined) {
  return answerType === "JUMBLED" || answerType === "BOTH" || !answerType;
}

function needsPersonal(answerType: AssessmentQuestion["answerType"] | undefined) {
  return answerType === "PERSONAL" || answerType === "BOTH" || !answerType;
}

function sanitizeOptionOrders(
  questions: AssessmentQuestion[],
  saved: Record<number, string[]>,
): Record<number, string[]> {
  const next: Record<number, string[]> = {};
  for (const q of questions) {
    if (!needsJumbled(q.answerType)) continue;
    const defaults = defaultOrderFor(q);
    const candidate = saved[q.id];
    if (
      candidate &&
      candidate.length === defaults.length &&
      defaults.every((id) => candidate.includes(id))
    ) {
      next[q.id] = candidate;
    } else {
      next[q.id] = defaults;
    }
  }
  return next;
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AssessmentView() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<ActiveAssessment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [optionOrders, setOptionOrders] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [startedAt, setStartedAt] = useState<number>(0);
  const [lockedQuestionIds, setLockedQuestionIds] = useState<number[]>([]);
  const [questionEnteredAt, setQuestionEnteredAt] = useState<
    Record<number, number>
  >({});
  const [overallRemainingMs, setOverallRemainingMs] = useState(0);
  const [questionRemainingMs, setQuestionRemainingMs] = useState(0);
  const [autoSubmitNotice, setAutoSubmitNotice] = useState<string | null>(null);

  const draftReadyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const lockingRef = useRef<Set<number>>(new Set());
  const clockOffsetRef = useRef(0);

  // Latest state for interval callbacks without stale closures.
  const stateRef = useRef({
    assessment: null as ActiveAssessment | null,
    questionIndex: 0,
    answers: {} as Record<number, string>,
    optionOrders: {} as Record<number, string[]>,
    startedAt: 0,
    lockedQuestionIds: [] as number[],
    questionEnteredAt: {} as Record<number, number>,
    questionIds: [] as number[],
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      draftReadyRef.current = false;
      try {
        const data = await assessmentApi.getActive();
        if (cancelled) return;

        const clientNow = Date.now();
        const serverMs = data.serverNow ? Date.parse(data.serverNow) : clientNow;
        clockOffsetRef.current = Number.isFinite(serverMs)
          ? serverMs - clientNow
          : 0;

        const questionIds = data.questions.map((q) => q.id);
        const draft = loadAssessmentDraft(data.id, questionIds);
        const now = clientNow + clockOffsetRef.current;

        const nextStartedAt = draft?.startedAt || now;
        let nextEntered = draft?.questionEnteredAt ?? {};
        let nextIndex = 0;
        if (draft) {
          nextIndex = Math.min(
            Math.max(0, draft.questionIndex),
            Math.max(0, data.questions.length - 1),
          );
        }

        const firstQuestion = data.questions[nextIndex];
        if (firstQuestion && !nextEntered[firstQuestion.id]) {
          nextEntered = { ...nextEntered, [firstQuestion.id]: now };
        }

        setAssessment(data);
        setAnswers(draft?.answers ?? {});
        setOptionOrders(
          sanitizeOptionOrders(data.questions, draft?.optionOrders ?? {}),
        );
        setStartedAt(nextStartedAt);
        setLockedQuestionIds(draft?.lockedQuestionIds ?? []);
        setQuestionEnteredAt(nextEntered);
        setQuestionIndex(nextIndex);
        setDraftStatus(draft ? "saved" : "idle");
        draftReadyRef.current = true;
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load assessment.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const questions = assessment?.questions ?? [];
  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const question = questions[questionIndex];
  const total = questions.length;
  const answer = question ? (answers[question.id] ?? "") : "";
  const optionOrder = question
    ? (optionOrders[question.id] ?? defaultOrderFor(question))
    : [];
  const wordCount = useMemo(() => countWords(answer), [answer]);
  const progress = total > 0 ? ((questionIndex + 1) / total) * 100 : 0;
  const showJumbled = question ? needsJumbled(question.answerType) : false;
  const showPersonal = question ? needsPersonal(question.answerType) : false;
  const isQuestionLocked = question
    ? lockedQuestionIds.includes(question.id)
    : false;
  const hasQuestionTimer =
    question != null &&
    question.durationSeconds != null &&
    Number(question.durationSeconds) >= 30;

  useEffect(() => {
    stateRef.current = {
      assessment,
      questionIndex,
      answers,
      optionOrders,
      startedAt,
      lockedQuestionIds,
      questionEnteredAt,
      questionIds,
    };
  }, [
    assessment,
    questionIndex,
    answers,
    optionOrders,
    startedAt,
    lockedQuestionIds,
    questionEnteredAt,
    questionIds,
  ]);

  function persistDraft(
    nextAnswers: Record<number, string>,
    nextOrders: Record<number, string[]>,
    nextIndex: number,
    nextLocked: number[],
    nextEntered: Record<number, number>,
    nextStartedAt: number,
    { immediate = false }: { immediate?: boolean } = {},
  ) {
    if (!assessment || !draftReadyRef.current) return;

    const write = () => {
      saveAssessmentDraft({
        assessmentId: assessment.id,
        questionIds,
        questionIndex: nextIndex,
        answers: nextAnswers,
        optionOrders: nextOrders,
        startedAt: nextStartedAt,
        lockedQuestionIds: nextLocked,
        questionEnteredAt: nextEntered,
      });
      setDraftStatus("saved");
    };

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    setDraftStatus("saving");
    if (immediate) {
      write();
      return;
    }

    saveTimerRef.current = setTimeout(write, 350);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function flush() {
      const s = stateRef.current;
      if (!s.assessment || !draftReadyRef.current) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveAssessmentDraft({
        assessmentId: s.assessment.id,
        questionIds: s.questionIds,
        questionIndex: s.questionIndex,
        answers: s.answers,
        optionOrders: s.optionOrders,
        startedAt: s.startedAt,
        lockedQuestionIds: s.lockedQuestionIds,
        questionEnteredAt: s.questionEnteredAt,
      });
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  async function submitAssessment(reason: "manual" | "overall") {
    const s = stateRef.current;
    if (!s.assessment || s.assessment.questions.length === 0) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    if (reason === "overall") {
      setAutoSubmitNotice("Time is up — submitting your assessment…");
    }

    persistDraft(
      s.answers,
      s.optionOrders,
      s.questionIndex,
      s.lockedQuestionIds,
      s.questionEnteredAt,
      s.startedAt,
      { immediate: true },
    );

    try {
      await assessmentApi.submit(s.assessment.id, {
        answers: s.assessment.questions.map((q) => ({
          questionId: q.id,
          optionOrder: needsJumbled(q.answerType)
            ? (s.optionOrders[q.id] ?? defaultOrderFor(q))
            : [],
          personalResponse: needsPersonal(q.answerType)
            ? (s.answers[q.id] ?? "")
            : "",
        })),
      });
      clearAssessmentDraft(s.assessment.id);
      router.push(ROUTES.assessmentSubmitted);
    } catch (err) {
      submittingRef.current = false;
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit assessment.",
      );
      setAutoSubmitNotice(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function lockQuestionAndAdvance(questionId: number) {
    const s = stateRef.current;
    if (!s.assessment) return;
    if (s.lockedQuestionIds.includes(questionId)) return;
    if (lockingRef.current.has(questionId)) return;
    lockingRef.current.add(questionId);

    const nextLocked = [...s.lockedQuestionIds, questionId];
    setLockedQuestionIds(nextLocked);
    // Keep ref in sync so the next tick sees the lock immediately.
    stateRef.current = { ...s, lockedQuestionIds: nextLocked };

    const currentIdx = s.assessment.questions.findIndex((q) => q.id === questionId);
    const isLast = currentIdx >= s.assessment.questions.length - 1;

    if (isLast) {
      persistDraft(
        s.answers,
        s.optionOrders,
        s.questionIndex,
        nextLocked,
        s.questionEnteredAt,
        s.startedAt,
        { immediate: true },
      );
      return;
    }

    const nextIndex = currentIdx + 1;
    const nextQuestion = s.assessment.questions[nextIndex];
    const now = Date.now() + clockOffsetRef.current;
    const nextEntered = {
      ...s.questionEnteredAt,
      ...(nextQuestion && !s.questionEnteredAt[nextQuestion.id]
        ? { [nextQuestion.id]: now }
        : {}),
    };

    setQuestionEnteredAt(nextEntered);
    setQuestionIndex(nextIndex);
    stateRef.current = {
      ...stateRef.current,
      questionIndex: nextIndex,
      questionEnteredAt: nextEntered,
      lockedQuestionIds: nextLocked,
    };
    persistDraft(
      s.answers,
      s.optionOrders,
      nextIndex,
      nextLocked,
      nextEntered,
      s.startedAt,
      { immediate: true },
    );
  }

  // Overall + per-question countdown tick.
  useEffect(() => {
    if (!assessment || !startedAt) return;

    const overallMs = Math.max(1, assessment.durationMinutes) * 60 * 1000;

    const tick = () => {
      const s = stateRef.current;
      if (!s.assessment || submittingRef.current) return;

      const now = Date.now() + clockOffsetRef.current;
      const overallLeft = Math.max(0, overallMs - (now - s.startedAt));
      setOverallRemainingMs(overallLeft);

      if (overallLeft <= 0) {
        void submitAssessment("overall");
        return;
      }

      const current = s.assessment.questions[s.questionIndex];
      if (!current) return;

      if (s.lockedQuestionIds.includes(current.id)) {
        setQuestionRemainingMs(0);
        return;
      }

      const durationSec = Number(current.durationSeconds);
      if (!Number.isFinite(durationSec) || durationSec < 30) {
        // No per-question timer configured for this question.
        setQuestionRemainingMs(-1);
        return;
      }

      const perQuestionMs = durationSec * 1000;
      const enteredAt = s.questionEnteredAt[current.id] || now;
      const questionLeft = Math.max(0, perQuestionMs - (now - enteredAt));
      setQuestionRemainingMs(questionLeft);

      if (questionLeft <= 0) {
        lockQuestionAndAdvance(current.id);
      }
    };

    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick uses refs for latest state
  }, [assessment, startedAt]);

  function ensureQuestionTimer(nextIndex: number, entered: Record<number, number>) {
    const nextQuestion = questions[nextIndex];
    if (!nextQuestion) return entered;
    if (entered[nextQuestion.id]) return entered;
    if (lockedQuestionIds.includes(nextQuestion.id)) return entered;
    const now = Date.now() + clockOffsetRef.current;
    return { ...entered, [nextQuestion.id]: now };
  }

  function updateAnswer(value: string) {
    if (!question || isQuestionLocked) return;
    setAnswers((prev) => {
      const next = { ...prev, [question.id]: value };
      persistDraft(
        next,
        optionOrders,
        questionIndex,
        lockedQuestionIds,
        questionEnteredAt,
        startedAt,
      );
      return next;
    });
  }

  function updateOptionOrder(nextOrder: string[]) {
    if (!question || isQuestionLocked) return;
    setOptionOrders((prev) => {
      const next = { ...prev, [question.id]: nextOrder };
      persistDraft(
        answers,
        next,
        questionIndex,
        lockedQuestionIds,
        questionEnteredAt,
        startedAt,
      );
      return next;
    });
  }

  function goPrevious() {
    if (questionIndex > 0) {
      const nextIndex = questionIndex - 1;
      const nextEntered = ensureQuestionTimer(nextIndex, questionEnteredAt);
      setQuestionEnteredAt(nextEntered);
      setQuestionIndex(nextIndex);
      persistDraft(
        answers,
        optionOrders,
        nextIndex,
        lockedQuestionIds,
        nextEntered,
        startedAt,
        { immediate: true },
      );
    } else {
      persistDraft(
        answers,
        optionOrders,
        questionIndex,
        lockedQuestionIds,
        questionEnteredAt,
        startedAt,
        { immediate: true },
      );
      router.push(ROUTES.dashboard);
    }
  }

  function goNext() {
    if (questionIndex >= total - 1) return;
    const nextIndex = questionIndex + 1;
    const nextEntered = ensureQuestionTimer(nextIndex, questionEnteredAt);
    setQuestionEnteredAt(nextEntered);
    setQuestionIndex(nextIndex);
    persistDraft(
      answers,
      optionOrders,
      nextIndex,
      lockedQuestionIds,
      nextEntered,
      startedAt,
      { immediate: true },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center text-sm text-muted">
        Loading assessment…
      </div>
    );
  }

  if (loadError || !assessment || !question) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <div className="rounded-[var(--radius-card)] border border-border bg-white p-6 shadow-sm">
          <h1 className="font-display text-xl font-bold text-foreground">
            Assessment unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loadError || "No active assessment is available right now."}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const draftLabel =
    draftStatus === "saving"
      ? "Auto-saving draft..."
      : draftStatus === "saved"
        ? "Draft saved"
        : "Auto-saving draft...";

  const overallUrgent = overallRemainingMs <= 60_000;
  const questionUrgent =
    hasQuestionTimer &&
    questionRemainingMs >= 0 &&
    questionRemainingMs <= 30_000;

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm text-primary">
        Journey{" "}
        <span className="text-muted">&gt;</span> Stage 0: Foundation
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {assessment.name || "Assessment"}
      </h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 shadow-sm",
            overallUrgent
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-border bg-white text-foreground",
          )}
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 shrink-0" />
            Overall time left
          </div>
          <p className="font-mono text-lg font-bold tracking-tight">
            {formatCountdown(overallRemainingMs)}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 shadow-sm",
            !hasQuestionTimer
              ? "border-border bg-surface text-muted"
              : isQuestionLocked
                ? "border-border bg-surface text-muted"
                : questionUrgent
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-border bg-white text-foreground",
          )}
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 shrink-0" />
            {!hasQuestionTimer
              ? "No question timer"
              : isQuestionLocked
                ? "Question locked"
                : "This question"}
          </div>
          <p className="font-mono text-lg font-bold tracking-tight">
            {!hasQuestionTimer
              ? "—"
              : isQuestionLocked
                ? "00:00"
                : formatCountdown(Math.max(0, questionRemainingMs))}
          </p>
        </div>
      </div>

      {(autoSubmitNotice || isQuestionLocked) && (
        <div className="mt-3 rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {autoSubmitNotice ||
            "Time for this question ran out. Your answer so far is saved and this question is locked."}
        </div>
      )}

      <div className="mt-4 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="shrink-0 text-xs font-semibold tracking-wider text-muted uppercase">
            Assessment Progress
          </p>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="shrink-0 text-sm font-medium text-foreground">
            Question {questionIndex + 1} of {total}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            {question.title}
          </h2>
          <p className="mt-1 text-xs font-semibold tracking-wider text-primary uppercase">
            {question.category}
            {question.answerType ? ` · ${question.answerType}` : ""}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {question.prompt ? <>{question.prompt} </> : null}
            <span className="font-semibold text-foreground">
              {question.question}
            </span>
          </p>

          {showJumbled && (
            <div className={cn(isQuestionLocked && "pointer-events-none opacity-70")}>
              <RearrangeableOptions
                options={question.options}
                order={optionOrder}
                onChange={updateOptionOrder}
              />
            </div>
          )}

          {showPersonal && (
            <>
              <label
                htmlFor="assessment-answer"
                className="mt-6 mb-2 block text-xs font-semibold tracking-wider text-muted uppercase"
              >
                Your Detailed Response
              </label>
              <textarea
                id="assessment-answer"
                value={answer}
                onChange={(e) => updateAnswer(e.target.value)}
                rows={4}
                disabled={isQuestionLocked}
                placeholder="Type your answer here... (minimum 100 words recommended for high score)"
                className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-80"
              />

              <div className="mt-2 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5" aria-live="polite">
                  <Info className="h-3.5 w-3.5" />
                  {draftLabel}
                </p>
                <p>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </p>
              </div>
            </>
          )}

          {!showPersonal && draftStatus !== "idle" ? (
            <p
              className="mt-4 flex items-center gap-1.5 text-xs text-muted"
              aria-live="polite"
            >
              <Info className="h-3.5 w-3.5" />
              {draftLabel}
            </p>
          ) : null}

          {submitError && (
            <p className="mt-3 text-sm text-red-600">{submitError}</p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              variant="secondary"
              onClick={goPrevious}
              disabled={isSubmitting}
              className="sm:min-w-[120px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={goNext}
              disabled={questionIndex >= total - 1 || isSubmitting}
              className={cn("sm:min-w-[100px]")}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => void submitAssessment("manual")}
              disabled={isSubmitting}
              className="sm:ml-auto sm:min-w-[160px]"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-primary">
                <Lightbulb className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                Tips for Success
              </h3>
            </div>
            <ul className="space-y-2.5">
              {question.tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Timers:</span> The full assessment
              ends after {assessment.durationMinutes} min and auto-submits if
              you have not already.
              {hasQuestionTimer
                ? ` This question has ${Math.round((Number(question.durationSeconds) / 60) * 10) / 10} min — it locks when that timer ends.`
                : " This question has no individual timer."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Info,
  Lightbulb,
  Send,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ASSESSMENT_QUESTIONS } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

function countWords(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function AssessmentView() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = ASSESSMENT_QUESTIONS[questionIndex];
  const total = ASSESSMENT_QUESTIONS.length;
  const answer = answers[question.id] ?? "";
  const wordCount = useMemo(() => countWords(answer), [answer]);
  const progress = ((questionIndex + 1) / total) * 100;

  function updateAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function goPrevious() {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      router.push(ROUTES.dashboard);
    }
  }

  function goNext() {
    if (questionIndex < total - 1) {
      setQuestionIndex((i) => i + 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push(ROUTES.assessmentSubmitted);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm text-primary">
        Journey{" "}
        <span className="text-muted">&gt;</span> Stage 0: Foundation
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Digital Literacy Assessment
      </h1>

      <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-white p-4 shadow-sm sm:p-5">
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
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {question.prompt}{" "}
            <span className="font-semibold text-foreground">
              {question.question}
            </span>
          </p>

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
            rows={8}
            placeholder="Type your answer here... (minimum 100 words recommended for high score)"
            className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="mt-2 flex flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Auto-saving draft...
            </p>
            <p>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              variant="secondary"
              onClick={goPrevious}
              className="sm:min-w-[120px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={goNext}
              disabled={questionIndex >= total - 1}
              className={cn("sm:min-w-[100px]")}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="sm:ml-auto sm:min-w-[160px]"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Answer"}
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
              <span className="font-semibold">Evaluation Process:</span> Your
              responses are reviewed for critical thinking, clarity, and
              innovation. Results are typically available within 24 hours.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

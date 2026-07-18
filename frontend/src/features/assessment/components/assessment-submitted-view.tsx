import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Play,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DASHBOARD_USER, INTRO_VIDEO } from "@/constants/dashboard";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";

export function AssessmentSubmittedView() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Hi, {DASHBOARD_USER.name}
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">
            Step 0: Stage Assessment
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-[var(--radius-card)] border border-border bg-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Your assessment is being evaluated
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Thank you for completing Stage 0. Our academic team is reviewing
              your responses for clarity, critical thinking, and alignment with
              your Explorer pathway.
            </p>
            <p className="mt-4 text-sm font-medium text-primary sm:text-base">
              Please wait for 24 hours, we will get back to you.
            </p>
            <Button
              disabled
              className="mt-6 w-full max-w-md bg-brand-100 text-muted hover:bg-brand-100"
            >
              <CheckCircle2 className="h-4 w-4" />
              Assessment Submitted
            </Button>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                <Clock className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                What&apos;s Next?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Once evaluation is complete, Stage 01 projects and curriculum
                unlock automatically on your dashboard.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                <Info className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                Retry Policy
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                If you do not pass, you may retake the Stage 0 assessment after a
                15-day waiting period.
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-sm">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-surface">
              <button
                type="button"
                aria-label="Play introduction video"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md"
              >
                <Play className="h-5 w-5 fill-current" />
              </button>
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-foreground">
              {INTRO_VIDEO.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{INTRO_VIDEO.caption}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted">
              <Clock className="h-3.5 w-3.5" />
              {INTRO_VIDEO.submittedDuration} Duration
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h3 className="font-display text-base font-bold text-foreground">
              Need help?
            </h3>
            <p className="mt-2 text-sm text-muted">
              Our support team is available 24/7 if you have questions about your
              evaluation.
            </p>
            <Link
              href={ROUTES.faq}
              className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

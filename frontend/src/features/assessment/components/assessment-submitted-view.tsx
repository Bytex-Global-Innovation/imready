"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  X,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DASHBOARD_USER, INTRO_VIDEO } from "@/constants/dashboard";
import { PROJECTS } from "@/constants/projects";
import { ROUTES } from "@/constants/routes";

const LOCKED_PROJECTS = PROJECTS.filter(
  (project) => project.category === "artificial-intelligence",
).slice(0, 2);

function DemoVideoModal({ onClose }: { onClose: () => void }) {
  // Push a history entry when the modal opens, so the device/browser back
  // button closes the modal (and reveals the assessment-submitted screen)
  // instead of navigating away from the page entirely.
  useEffect(() => {
    window.history.pushState({ demoVideoOpen: true }, "");

    function handlePopState() {
      onClose();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose]);

  // Closing via the X button or the background both consume the pushed
  // history entry, keeping back-button behavior consistent either way.
  function handleClose() {
    window.history.back();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-[2px]"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-video-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-xl"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 inline-flex cursor-pointer rounded-md p-1 text-muted hover:bg-surface hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-surface">
          <button
            type="button"
            aria-label="Play introduction video"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>
        </div>

        <h3
          id="demo-video-title"
          className="mt-4 font-display text-base font-bold text-foreground"
        >
          {INTRO_VIDEO.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{INTRO_VIDEO.caption}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted">
          <Clock className="h-3.5 w-3.5" />
          {INTRO_VIDEO.submittedDuration} Duration
        </p>
      </div>
    </div>
  );
}

export function AssessmentSubmittedView() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const closeVideoModal = useCallback(() => setIsVideoOpen(false), []);

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

        <Button
          variant="secondary"
          size="sm"
          className="sm:hidden"
          onClick={() => setIsVideoOpen(true)}
        >
          <Play className="h-3.5 w-3.5" />
          Watch Demo Video
        </Button>
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

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted" />
              <h3 className="font-display text-base font-bold text-foreground">
                Stage 01: Locked Projects
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {LOCKED_PROJECTS.map((project) => (
                <article
                  key={project.id}
                  className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-white shadow-sm"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={project.imageSrc}
                      alt={project.imageAlt}
                      fill
                      className="object-cover grayscale"
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                        <Lock className="h-4 w-4 text-foreground" />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-4.5">
                    <h4 className="font-display text-base font-bold text-foreground">
                      {project.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                      <span className="line-clamp-2">{project.description}</span>{" "}
                      <span className="font-medium text-foreground">
                        Locked until Stage 01.
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden space-y-4 sm:block">
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

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:hidden">
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
      </div>

      {isVideoOpen ? <DemoVideoModal onClose={closeVideoModal} /> : null}
    </div>
  );
}
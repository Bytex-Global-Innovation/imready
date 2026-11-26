"use client";

import { useEffect, useState } from "react";
import {
  FIT_FOR,
  FIT_NOT,
  HERO,
  HOW_STEPS,
  HOW_TIME,
  HOW_TIME_DETAIL,
  PRICING_INTRO,
  PRICING_MODEL,
  PRICING_POINTS,
  PROCESS_FLOW,
  PROCESS_STAGES,
  PROMISE_CHIPS,
  PROMISE_DETAILS,
  REFUND_COPY,
  SITE,
  TERMS,
  WHY_ITEMS,
  contactEmail,
  whatsappUrl,
} from "@/constants/founder-landing";
import LandingFaq from "@/components/landing/landing-faq";
import LandingHeader from "@/components/landing/landing-header";
import ReserveCta from "@/components/landing/reserve-cta";
import ShareProblemForm from "@/components/landing/share-problem-form";

function useHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return [hash, setHash] as const;
}

function exitShareProblem(setHash: (value: string) => void) {
  const clearShareHash = () => {
    const next = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", next);
    setHash("");
  };

  // history.back() (-1) matches the browser back button. If that lands on
  // /login-admin or leaves us on the form, fall back to the landing without hash.
  const shareHash = `#${SITE.shareProblemHash}`;
  window.history.back();
  window.setTimeout(() => {
    if (window.location.pathname.includes("/login-admin")) {
      window.history.replaceState(null, "", "/");
      setHash("");
      return;
    }
    if (window.location.hash === shareHash) {
      clearShareHash();
    }
  }, 50);
}

export default function FounderLandingPage() {
  const [hash, setHash] = useHash();
  const shareMode = hash === `#${SITE.shareProblemHash}`;
  const year = new Date().getFullYear();
  const email = contactEmail();
  const whatsapp = whatsappUrl();

  useEffect(() => {
    if (shareMode) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    // Header nav handles click scrolling. This covers browser back/forward
    // and direct hash loads without an instant jump.
    const id = hash.startsWith("#") ? hash.slice(1) : "";
    if (!id || id === SITE.shareProblemHash) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [hash, shareMode]);

  if (shareMode) {
    return (
      <div className="landing-root min-h-dvh bg-[var(--landing-bg)] text-[var(--landing-foreground)]">
        <main
          id="main"
          className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14"
        >
          <a
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
            onClick={(event) => {
              event.preventDefault();
              exitShareProblem(setHash);
            }}
          >
            Back
          </a>
          <div className="mt-4">
            <ShareProblemForm />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="landing-root min-h-dvh bg-[var(--landing-bg)] text-[var(--landing-foreground)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-[var(--landing-foreground)]"
      >
        Skip to content
      </a>

      <LandingHeader />

      <main id="main">
        {/* Hero */}
        <section aria-labelledby="page-title" className="py-12 sm:py-16">
          <div className="mx-auto grid w-full max-w-5xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
                {HERO.eyebrow}
              </p>
              <h1
                id="page-title"
                className="mt-4 font-[family-name:var(--font-landing-display)] text-[2rem] leading-[1.15] font-medium tracking-tight text-balance sm:text-5xl"
              >
                {HERO.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--landing-muted)]">
                {HERO.body}
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed font-medium">
                {HERO.note}
              </p>
              <p className="mt-5 inline-flex rounded-full border border-[var(--landing-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--landing-primary)] shadow-sm">
                {SITE.batchLabel}
              </p>
              <ReserveCta
                className="mt-6"
                showReassurance={false}
                showPendingNote={false}
              />
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--landing-muted)]">
                {REFUND_COPY}
              </p>
            </div>

            <aside className="rounded-2xl border border-[var(--landing-border)] border-t-2 border-t-[var(--landing-primary)] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-[family-name:var(--font-landing-display)] text-2xl font-medium tracking-tight">
                The terms
              </h2>
              <p className="mt-3 font-[family-name:var(--font-landing-display)] text-5xl leading-none font-medium tracking-tight text-[var(--landing-primary)] lining-nums">
                {SITE.reservationFee}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--landing-muted)]">
                reservation fee for your demo project.
              </p>
              <dl className="mt-4">
                {TERMS.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 border-t border-[var(--landing-border)] py-2.5 text-sm"
                  >
                    <dt className="text-[var(--landing-muted)]">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        {/* Promise */}
        <section
          id="promise"
          aria-labelledby="promise-title"
          className="bg-[var(--landing-foreground)] text-white"
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
            <h2
              id="promise-title"
              className="font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight"
            >
              Our promise
            </h2>
            <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
              {PROMISE_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="border-l-2 border-white/50 pl-3 text-sm leading-snug font-semibold"
                >
                  {chip}
                </li>
              ))}
            </ul>
            <ul className="mt-8 max-w-3xl space-y-2 text-sm leading-relaxed text-white/90">
              {PROMISE_DETAILS.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why */}
        <section
          id="why"
          aria-labelledby="why-title"
          className="py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
            <h2
              id="why-title"
              className="max-w-2xl font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
            >
              Why founders do it
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2">
              {WHY_ITEMS.map((item, index) => (
                <li
                  key={item.title}
                  className="border-t border-[var(--landing-border)] pt-5"
                >
                  <p className="font-[family-name:var(--font-landing-display)] text-2xl text-[var(--landing-primary)] lining-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-landing-display)] text-2xl leading-snug font-medium">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--landing-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* How */}
        <section
          id="how"
          aria-labelledby="how-title"
          className="border-t border-[var(--landing-border)] py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
            <h2
              id="how-title"
              className="font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
            >
              How it works
            </h2>
            <ol className="mt-10 max-w-3xl border-l border-[var(--landing-foreground)]/20">
              {HOW_STEPS.map((step, index) => (
                <li key={step} className="relative pb-8 pl-8 last:pb-0">
                  <span className="absolute top-0 -left-3 flex size-6 items-center justify-center bg-[var(--landing-foreground)] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-lg leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 max-w-3xl border border-[var(--landing-foreground)]/15 bg-white p-5">
              <p className="font-[family-name:var(--font-landing-display)] text-2xl font-medium">
                {HOW_TIME}
              </p>
              <p className="mt-2 text-base leading-relaxed text-[var(--landing-muted)]">
                {HOW_TIME_DETAIL}
              </p>
            </div>

            <div className="mt-12">
              <h3 className="font-[family-name:var(--font-landing-display)] text-2xl font-medium">
                A structured product process
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--landing-muted)]">
                Students move through these stages. You choose how involved you
                are at each one.
              </p>
              <ol className="mt-5 flex flex-wrap gap-2">
                {PROCESS_STAGES.map((stage, index) => (
                  <li
                    key={stage}
                    className="flex items-baseline gap-2 border border-[var(--landing-border)] bg-white px-3 py-2"
                  >
                    <span className="text-xs font-semibold text-[var(--landing-muted)] lining-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-[family-name:var(--font-landing-display)] text-lg leading-snug">
                      {stage}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-[var(--landing-muted)]">
                {PROCESS_FLOW}
              </p>
            </div>
          </div>
        </section>

        {/* Fit */}
        <section
          id="fit"
          aria-labelledby="fit-title"
          className="border-t border-[var(--landing-border)] py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
              A straight fit check
            </p>
            <h2
              id="fit-title"
              className="mt-2 font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
            >
              Who this is for
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="border border-[var(--landing-foreground)]/15 bg-white p-5 sm:p-6">
                <h3 className="font-[family-name:var(--font-landing-display)] text-2xl font-medium">
                  This is for you if
                </h3>
                <ul className="mt-4 space-y-3">
                  {FIT_FOR.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 font-semibold text-[var(--landing-primary)]"
                      >
                        +
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="border border-[var(--landing-foreground)]/15 bg-white p-5 sm:p-6">
                <h3 className="font-[family-name:var(--font-landing-display)] text-2xl font-medium">
                  Who this is not for
                </h3>
                <ul className="mt-4 space-y-3">
                  {FIT_NOT.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-base leading-relaxed"
                    >
                      <span aria-hidden className="mt-0.5 font-semibold">
                        –
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Pricing fee */}
        <section
          id="pricing"
          aria-labelledby="pricing-title"
          className="border-t border-[var(--landing-border)] py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
              The fee
            </p>
            <h2
              id="pricing-title"
              className="mt-2 font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
            >
              A small reservation fee
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed">
              {PRICING_INTRO}
            </p>
            <div className="mt-8 max-w-3xl rounded-2xl border border-[var(--landing-border)] bg-white p-5 shadow-sm sm:p-7">
              <dl>
                {PRICING_POINTS.map((point) => (
                  <div
                    key={point.title}
                    className="border-t border-[var(--landing-border)] py-4 first:border-t-0 first:pt-0"
                  >
                    <dt className="text-sm font-semibold">{point.title}</dt>
                    <dd className="mt-1 text-base leading-relaxed">
                      {point.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <ReserveCta className="mt-8" showReassurance={false} />
          </div>
        </section>

        {/* Pricing model */}
        <section
          id="pricing-model"
          aria-labelledby="pricing-model-title"
          className="border-t border-[var(--landing-border)] py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
              {PRICING_MODEL.eyebrow}
            </p>
            <h2
              id="pricing-model-title"
              className="mt-2 max-w-2xl font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight sm:text-4xl"
            >
              {PRICING_MODEL.title}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed">
              {PRICING_MODEL.body}
            </p>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {PRICING_MODEL.points.map((point, index) => (
                <li
                  key={point.title}
                  className="border-t border-[var(--landing-border)] pt-5"
                >
                  <p className="font-[family-name:var(--font-landing-display)] text-2xl text-[var(--landing-primary)] lining-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-landing-display)] text-2xl leading-snug font-medium">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--landing-muted)]">
                    {point.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <LandingFaq />

        {/* Hidden student proof placeholder — matches source page */}
        <section id="student-proof" hidden aria-hidden="true">
          <h2>Add real student demo screenshots/testimonials here</h2>
          <p>
            Add real student demo screenshots/testimonials here. Leave this
            section hidden until the material is real.
          </p>
        </section>
      </main>

      <footer className="bg-[var(--landing-foreground)] text-white">
        <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
          <p className="font-[family-name:var(--font-landing-display)] text-2xl font-medium">
            {SITE.name}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">
            Have a problem worth solving? See working demos before you invest in
            the build.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>
              <a
                href={SITE.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                ImReady on LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="underline underline-offset-4">
                  {email}
                </a>
              </li>
            ) : null}
            {whatsapp ? (
              <li>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  WhatsApp
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
          </ul>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-white/90">
            {SITE.privacyNote}
          </p>
          <p className="mt-6 text-sm text-white/80">
            © {year} {SITE.name}.
          </p>
        </div>
      </footer>
    </div>
  );
}

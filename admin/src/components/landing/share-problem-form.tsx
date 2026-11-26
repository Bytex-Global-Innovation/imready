"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SITE,
  isConfigured,
  shareProblemMailto,
  whatsappUrl,
} from "@/constants/founder-landing";
import {
  BLOCKERS,
  EFFORT_OPTIONS,
  INVOLVEMENT_OPTIONS,
  PROJECT_TYPE_GROUPS,
  PROJECT_TYPE_OTHER,
  READY_PHASES,
  ShareProblemErrors,
  ShareProblemFormState,
  buildShareProblemMessage,
  emptyShareProblemForm,
  validateShareProblem,
} from "@/constants/share-problem";

type SubmitStatus =
  | null
  | {
      status: "sent" | "mailto" | "whatsapp" | "error" | "unconfigured";
      message: string;
      href?: string;
    };

const fieldClass =
  "h-11 w-full rounded-lg border border-[var(--landing-border)] bg-white px-3 text-base text-[var(--landing-foreground)] outline-none transition-colors focus:border-[var(--landing-primary)] focus:ring-3 focus:ring-[var(--landing-primary)]/20";

export default function ShareProblemForm() {
  const formId = useId();
  const [form, setForm] = useState(emptyShareProblemForm);
  const [errors, setErrors] = useState<ShareProblemErrors>({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>(null);
  const [copied, setCopied] = useState(false);
  const [copyHint, setCopyHint] = useState("");
  const statusRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const whatsapp = whatsappUrl();

  useEffect(() => {
    if (!status || !statusRef.current) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    statusRef.current.focus();
    statusRef.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [status]);

  function updateField<K extends keyof ShareProblemFormState>(
    key: K,
    value: ShareProblemFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleProjectType(id: string) {
    setForm((prev) => {
      const exists = prev.projectTypes.includes(id);
      return {
        ...prev,
        projectTypes: exists
          ? prev.projectTypes.filter((item) => item !== id)
          : [...prev.projectTypes, id],
      };
    });
    setErrors((prev) => {
      if (!prev.projectTypes && !prev.projectTypeOther) return prev;
      const next = { ...prev };
      delete next.projectTypes;
      if (id === PROJECT_TYPE_OTHER) delete next.projectTypeOther;
      return next;
    });
  }

  function updatePhase(
    phaseId: string,
    patch: Partial<ShareProblemFormState["phases"][string]>
  ) {
    setForm((prev) => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phaseId]: { ...prev.phases[phaseId], ...patch },
      },
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateShareProblem(form);
    setErrors(nextErrors);
    setCopied(false);
    setCopyHint("");

    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      setStatus(null);
      document.getElementById(`${formId}-${firstError}`)?.focus();
      return;
    }

    const message = buildShareProblemMessage(form);
    const externalEndpoint = SITE.formEndpoint.trim();
    const mailto = shareProblemMailto(message);
    const whatsappHref = whatsappUrl(message);
    const readyPlan = READY_PHASES.map((phase) => {
      const state = form.phases[phase.id];
      return {
        phase: phase.id,
        involvement: state.involvement,
        effort: state.involvement === "skip" ? null : state.effort,
      };
    });
    const payload = {
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      paymentReference: form.paymentReference.trim(),
      ideaStage: form.ideaStage,
      problem: form.problem.trim(),
      blocker: form.blocker,
      blockerOther:
        form.blocker === "other" ? form.blockerOther.trim() : "",
      projectTypes: form.projectTypes,
      projectTypeOther: form.projectTypeOther.trim(),
      readyPlan,
      message,
      source: "imready-admin-landing",
    };
    setSending(true);

    try {
      // Persist every field to the DB first (Clients tab reads from here).
      const apiBase = (
        process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
      ).replace(/\/$/, "");

      if (!apiBase) {
        setStatus({ status: "unconfigured", message });
        return;
      }

      try {
        const response = await fetch(`${apiBase}/landing/share-problem`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000),
        });
        if (!response.ok) {
          setStatus({ status: "error", message });
          return;
        }
      } catch {
        setStatus({ status: "error", message });
        return;
      }

      if (isConfigured(externalEndpoint)) {
        try {
          const body = new FormData();
          body.set("name", payload.name);
          body.set("company", payload.company);
          body.set("email", payload.email);
          body.set("phone", payload.phone);
          body.set("paymentReference", payload.paymentReference);
          body.set("ideaStage", payload.ideaStage);
          body.set("problem", payload.problem);
          body.set("blocker", payload.blocker);
          body.set("blockerOther", payload.blockerOther);
          body.set("projectTypeOther", payload.projectTypeOther);
          for (const type of payload.projectTypes) {
            body.append("projectTypes", type);
          }
          body.set("projectTypesCsv", payload.projectTypes.join(","));
          body.set("readyPlan", JSON.stringify(readyPlan));
          for (const phase of READY_PHASES) {
            const state = form.phases[phase.id];
            body.set(`ready_${phase.id}`, state.involvement);
            body.set(
              `ready_${phase.id}_effort`,
              state.involvement === "skip" ? "" : state.effort
            );
          }
          body.set("subject", "ImReady — problem shared after payment");
          body.set("source", payload.source);
          body.set("message", message);

          await fetch(externalEndpoint, {
            method: "POST",
            body,
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(20000),
          });
        } catch {
          // DB save already succeeded; external endpoint is best-effort.
        }
      }

      if (whatsappHref) {
        setStatus({
          status: "whatsapp",
          message,
          href: whatsappHref,
        });
        window.open(whatsappHref, "_blank", "noopener,noreferrer");
        return;
      }

      if (mailto) {
        window.location.href = mailto;
        setStatus({ status: "mailto", message });
        return;
      }

      setStatus({ status: "sent", message });
    } finally {
      setSending(false);
    }
  }

  async function copyMessage() {
    const value = messageRef.current?.value ?? status?.message ?? "";
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyHint("");
    } catch {
      setCopied(false);
      setCopyHint("Select the message and copy it.");
      messageRef.current?.focus();
      messageRef.current?.select();
    }
  }

  return (
    <div className="border border-[var(--landing-foreground)]/15 bg-white p-5 sm:p-7">
      <p className="text-xs font-semibold tracking-[0.16em] text-[var(--landing-primary)] uppercase">
        After you pay
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-landing-display)] text-3xl font-medium tracking-tight">
        Share your problem
      </h2>
      <p className="mt-3 text-base leading-relaxed">
        Step 2. Add the UTR from your UPI payment. We confirm within 24 hours,
        then scope the problem in a 30-minute kickoff.
      </p>

      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
        {Object.keys(errors).length > 0 ? (
          <p
            role="alert"
            className="border border-red-400/40 bg-[var(--landing-bg)] px-3 py-2 text-sm text-red-700"
          >
            Check the highlighted fields. Nothing has been sent yet.
          </p>
        ) : null}

        {status ? (
          <div
            className="border border-[var(--landing-foreground)]/15 bg-[var(--landing-bg)] px-3 py-3"
            role="status"
          >
            <h3
              ref={statusRef}
              tabIndex={-1}
              className="font-[family-name:var(--font-landing-display)] text-xl font-medium outline-none"
            >
              {status.status === "sent" ? "Problem shared" : "Next step"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              {status.status === "sent"
                ? "Saved. We confirm within 24 hours, then arrange the 30-minute kickoff."
                : status.status === "mailto"
                  ? "Saved on our side. Your email app should open with this message. Send it to finish sharing the problem. If nothing opened, copy the message below."
                  : status.status === "whatsapp"
                    ? "Saved on our side. WhatsApp should open with this problem filled in. Send that message to finish sharing it. If nothing opened, use the link below or copy the message."
                    : status.status === "error"
                      ? "Nothing was saved. The form service did not accept it. Copy the message below, or use Have a question first? Talk to us."
                      : "This page cannot save submissions yet, so nothing was stored. Copy the message and use Have a question first? Talk to us. The text below stays on this device."}
            </p>
            {status.href ? (
              <a
                href={status.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                Open WhatsApp
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        ) : null}

        {status ? (
          <div>
            <label
              htmlFor={`${formId}-copy`}
              className="text-sm font-medium"
            >
              Message
            </label>
            <textarea
              ref={messageRef}
              id={`${formId}-copy`}
              readOnly
              value={status.message}
              className={`${fieldClass} mt-2 min-h-40 py-2`}
            />
            <button
              type="button"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg border border-[var(--landing-foreground)]/20 bg-white px-4 text-base font-medium transition-colors hover:bg-[var(--landing-bg)]"
              onClick={copyMessage}
            >
              {copied ? "Copied" : "Copy message"}
            </button>
            {copyHint ? (
              <p className="mt-2 text-sm text-[var(--landing-muted)]">
                {copyHint}
              </p>
            ) : null}
          </div>
        ) : null}

        <Field
          id={`${formId}-name`}
          label="Name"
          error={errors.name}
          hint="The person we should write to."
        >
          <input
            id={`${formId}-name`}
            name="name"
            autoComplete="name"
            value={form.name}
            aria-invalid={errors.name ? true : undefined}
            className={fieldClass}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </Field>

        <Field
          id={`${formId}-company`}
          label="Company"
          error={errors.company}
          hint="Company, studio, or the name you trade under."
        >
          <input
            id={`${formId}-company`}
            name="company"
            autoComplete="organization"
            value={form.company}
            aria-invalid={errors.company ? true : undefined}
            className={fieldClass}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </Field>

        <Field id={`${formId}-email`} label="Email" error={errors.email}>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            value={form.email}
            aria-invalid={errors.email ? true : undefined}
            className={fieldClass}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </Field>

        <Field
          id={`${formId}-phone`}
          label="Phone / WhatsApp"
          error={errors.phone}
          hint="A number we can reach you on. WhatsApp is fine."
        >
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={form.phone}
            aria-invalid={errors.phone ? true : undefined}
            className={fieldClass}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </Field>

        <Field
          id={`${formId}-paymentReference`}
          label="UPI transaction ID (UTR)"
          error={errors.paymentReference}
          hint="Find it in your UPI app's payment details. We match it manually."
        >
          <input
            id={`${formId}-paymentReference`}
            name="paymentReference"
            autoComplete="off"
            value={form.paymentReference}
            aria-invalid={errors.paymentReference ? true : undefined}
            className={fieldClass}
            onChange={(e) => updateField("paymentReference", e.target.value)}
          />
        </Field>

        <Field
          id={`${formId}-problem`}
          label="Problem description"
          error={errors.problem}
          hint="What's the problem, who has it, and what would a good demo show? Don't share confidential data; we sign an NDA on request."
        >
          <textarea
            id={`${formId}-problem`}
            name="problem"
            rows={6}
            value={form.problem}
            aria-invalid={errors.problem ? true : undefined}
            className={`${fieldClass} min-h-36 resize-y py-2`}
            onChange={(e) => updateField("problem", e.target.value)}
          />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium">
            Rough idea or a defined problem?
          </legend>
          <p
            id={`${formId}-ideaStage-hint`}
            className="mt-1 text-sm leading-relaxed text-[var(--landing-muted)]"
          >
            Either is fine. With a rough idea, teams start by talking to users
            to sharpen it.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <RadioCard
              name={`${formId}-ideaStage`}
              checked={form.ideaStage === "rough"}
              invalid={Boolean(errors.ideaStage)}
              onChange={() => updateField("ideaStage", "rough")}
            >
              Rough idea
            </RadioCard>
            <RadioCard
              name={`${formId}-ideaStage`}
              checked={form.ideaStage === "defined"}
              invalid={Boolean(errors.ideaStage)}
              onChange={() => updateField("ideaStage", "defined")}
            >
              Defined problem
            </RadioCard>
          </div>
          {errors.ideaStage ? (
            <p className="mt-2 text-sm text-red-700">{errors.ideaStage}</p>
          ) : null}
        </fieldset>

        <fieldset
          id={`${formId}-projectTypes`}
          tabIndex={-1}
          aria-invalid={errors.projectTypes ? true : undefined}
        >
          <legend className="text-sm font-medium">Project type</legend>
          <p className="mt-1 text-sm text-[var(--landing-muted)]">
            Tick every type that fits. One is enough.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {PROJECT_TYPE_GROUPS.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--landing-primary)] uppercase">
                  {group.label}
                </p>
                <div className="mt-2 grid gap-1.5">
                  {group.options.map((option, index) => {
                    const prior = PROJECT_TYPE_GROUPS.slice(
                      0,
                      PROJECT_TYPE_GROUPS.findIndex((g) => g.id === group.id)
                    ).reduce((sum, g) => sum + g.options.length, 0);
                    const number = prior + index + 1;
                    return (
                      <CheckCard
                        key={option.id}
                        checked={form.projectTypes.includes(option.id)}
                        onChange={() => toggleProjectType(option.id)}
                      >
                        <span className="w-5 shrink-0 font-semibold text-[var(--landing-muted)] tabular-nums">
                          {number}
                        </span>
                        <span>{option.label}</span>
                      </CheckCard>
                    );
                  })}
                </div>
              </div>
            ))}
            <CheckCard
              checked={form.projectTypes.includes(PROJECT_TYPE_OTHER)}
              onChange={() => toggleProjectType(PROJECT_TYPE_OTHER)}
            >
              Other
            </CheckCard>
            {form.projectTypes.includes(PROJECT_TYPE_OTHER) ? (
              <Field
                id={`${formId}-projectTypeOther`}
                label="Other project type"
                error={errors.projectTypeOther}
              >
                <input
                  id={`${formId}-projectTypeOther`}
                  name="projectTypeOther"
                  value={form.projectTypeOther}
                  aria-invalid={errors.projectTypeOther ? true : undefined}
                  className={fieldClass}
                  onChange={(e) =>
                    updateField("projectTypeOther", e.target.value)
                  }
                />
              </Field>
            ) : null}
          </div>
          {errors.projectTypes ? (
            <p className="mt-2 text-sm text-red-700">{errors.projectTypes}</p>
          ) : null}
        </fieldset>

        <div>
          <label
            htmlFor={`${formId}-blocker`}
            className="text-sm font-medium"
          >
            Biggest blocker today
          </label>
          <p
            id={`${formId}-blocker-hint`}
            className="mt-1 text-sm leading-relaxed text-[var(--landing-muted)]"
          >
            What is most in the way of doing this yourself?
          </p>
          <select
            id={`${formId}-blocker`}
            name="blocker"
            value={form.blocker}
            aria-invalid={errors.blocker ? true : undefined}
            className={`${fieldClass} mt-2`}
            onChange={(e) => updateField("blocker", e.target.value)}
          >
            <option value="">Select one</option>
            {BLOCKERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.blocker ? (
            <p className="mt-2 text-sm text-red-700">{errors.blocker}</p>
          ) : null}
          {form.blocker === "other" ? (
            <div className="mt-3">
              <Field
                id={`${formId}-blockerOther`}
                label="What is the blocker?"
                error={errors.blockerOther}
              >
                <input
                  id={`${formId}-blockerOther`}
                  name="blockerOther"
                  value={form.blockerOther}
                  aria-invalid={errors.blockerOther ? true : undefined}
                  className={fieldClass}
                  onChange={(e) => updateField("blockerOther", e.target.value)}
                />
              </Field>
            </div>
          ) : null}
        </div>

        <fieldset>
          <legend className="text-sm font-medium">
            How should the teams work?
          </legend>
          <p className="mt-1 text-sm leading-relaxed text-[var(--landing-muted)]">
            Say how much you want to do yourself. Build is set to students
            making the demo, in depth. Change any row.
          </p>
          <ol className="mt-4 grid gap-3">
            {READY_PHASES.map((phase) => {
              const state = form.phases[phase.id];
              return (
                <li
                  key={phase.id}
                  className="border border-[var(--landing-border)] bg-[var(--landing-bg)] p-3"
                >
                  <h3 className="font-[family-name:var(--font-landing-display)] text-xl font-medium">
                    {phase.name}
                  </h3>
                  <p className="text-sm text-[var(--landing-muted)]">
                    {phase.detail}
                  </p>
                  <div className="mt-3 grid gap-2">
                    {INVOLVEMENT_OPTIONS.map((option) => (
                      <RadioCard
                        key={option.id}
                        name={`${formId}-ready-${phase.id}`}
                        checked={state.involvement === option.id}
                        onChange={() =>
                          updatePhase(phase.id, { involvement: option.id })
                        }
                      >
                        {option.label}
                      </RadioCard>
                    ))}
                  </div>
                  <label
                    className="mt-3 block text-sm font-medium"
                    htmlFor={`${formId}-effort-${phase.id}`}
                  >
                    Effort
                    <select
                      id={`${formId}-effort-${phase.id}`}
                      className={`${fieldClass} mt-1`}
                      value={state.effort}
                      disabled={state.involvement === "skip"}
                      onChange={(e) =>
                        updatePhase(phase.id, {
                          effort: e.target.value as typeof state.effort,
                        })
                      }
                    >
                      {EFFORT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              );
            })}
          </ol>
        </fieldset>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--landing-primary)] px-5 text-base font-medium text-white transition-colors hover:bg-[var(--landing-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "Sending…" : "Share your problem"}
        </button>

        {whatsapp ? (
          <p className="text-sm">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Message on WhatsApp
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ) : null}

        <p className="text-sm leading-relaxed text-[var(--landing-muted)]">
          {SITE.privacyNote}{" "}
          <a
            href="#faq"
            className="font-medium text-[var(--landing-foreground)] underline underline-offset-4"
          >
            Questions about refunds, IP, and the NDA
          </a>
          .
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint ? (
        <p className="mt-1 text-sm leading-relaxed text-[var(--landing-muted)]">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function RadioCard({
  name,
  checked,
  invalid,
  onChange,
  children,
}: {
  name: string;
  checked: boolean;
  invalid?: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-3 border px-3 text-sm leading-snug ${
        checked
          ? "border-[var(--landing-foreground)] bg-[var(--landing-bg)]"
          : "border-[var(--landing-border)] bg-white"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        aria-invalid={invalid ? true : undefined}
        className="size-4 shrink-0 accent-[var(--landing-foreground)]"
        onChange={onChange}
      />
      {children}
    </label>
  );
}

function CheckCard({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-start gap-3 border px-3 py-2.5 text-sm leading-snug ${
        checked
          ? "border-[var(--landing-foreground)] bg-[var(--landing-bg)]"
          : "border-[var(--landing-border)] bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--landing-foreground)]"
        onChange={onChange}
      />
      {children}
    </label>
  );
}

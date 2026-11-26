"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import {
  REFUND_COPY,
  SITE,
  buildUpiUri,
  isConfigured,
  paymentPageUrl,
  upiQrImageUrl,
} from "@/constants/founder-landing";
import TalkToUs from "@/components/landing/talk-to-us";

type Placement = "inline" | "header";

export default function ReserveCta({
  className = "",
  showReassurance = true,
  showPendingNote = true,
  placement = "inline",
}: {
  className?: string;
  showReassurance?: boolean;
  showPendingNote?: boolean;
  placement?: Placement;
}) {
  const titleId = useId();
  const upiUri = buildUpiUri();
  const upiReady = Boolean(upiUri && isConfigured(SITE.upiId));
  const paymentUrl = paymentPageUrl();
  const canReserve = upiReady || Boolean(paymentUrl);
  const qrUrl = upiQrImageUrl(180);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(SITE.upiId.trim());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const headerBtn =
    "h-9 shrink-0 px-3 text-sm md:h-11 md:px-5 md:text-base";
  const inlineBtn = "h-11 px-5 text-base";
  const btnSize = placement === "header" ? headerBtn : inlineBtn;

  const primaryBtnClass = `inline-flex items-center justify-center rounded-lg bg-[var(--landing-primary)] font-medium text-white transition-colors hover:bg-[var(--landing-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 ${btnSize}`;

  return (
    <div className={className}>
      <div
        className={
          placement === "header"
            ? "flex flex-row items-center gap-3"
            : "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        }
      >
        {canReserve ? (
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => {
              setCopied(false);
              setOpen(true);
            }}
          >
            <span className={placement === "header" ? "md:hidden" : "hidden"}>
              Reserve
            </span>
            <span
              className={placement === "header" ? "hidden md:inline" : "inline"}
            >
              Reserve your spot
            </span>
          </button>
        ) : (
          <button type="button" disabled className={primaryBtnClass}>
            <span className={placement === "header" ? "md:hidden" : "hidden"}>
              Reserve
            </span>
            <span
              className={placement === "header" ? "hidden md:inline" : "inline"}
            >
              Reserve your spot
            </span>
          </button>
        )}

        <TalkToUs
          compact={placement === "header"}
          className={placement === "header" ? "hidden lg:block" : ""}
        />
      </div>

      {showReassurance ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed">{REFUND_COPY}</p>
      ) : null}

      {!canReserve && showPendingNote ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--landing-muted)]">
          UPI details coming soon.
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
            aria-label="Close reserve dialog"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 grid max-h-[85vh] w-full max-w-[calc(100%-2rem)] gap-4 overflow-y-auto rounded-xl bg-white p-4 text-sm text-[var(--landing-foreground)] shadow-xl ring-1 ring-[var(--landing-foreground)]/10 sm:max-w-md"
          >
            <button
              type="button"
              className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-lg text-[var(--landing-muted)] transition-colors hover:bg-[var(--landing-bg)] hover:text-[var(--landing-foreground)]"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col gap-2 pr-8">
              <h2
                id={titleId}
                className="font-[family-name:var(--font-landing-display)] text-2xl font-medium"
              >
                Reserve your spot
              </h2>
              <p className="text-sm leading-relaxed text-[var(--landing-muted)]">
                {REFUND_COPY}
              </p>
            </div>

            {upiReady ? (
              <div className="grid gap-4">
                <div className="flex flex-col items-center gap-4 text-center">
                  <h3 className="font-[family-name:var(--font-landing-display)] text-xl font-bold tracking-tight text-[var(--landing-foreground)]">
                    Pay ₹449 via UPI
                  </h3>

                  {qrUrl ? (
                    <div className="rounded-lg bg-white p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt="UPI QR code for ₹449"
                        width={180}
                        height={180}
                        className="size-[180px]"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <p className="font-medium break-all">{SITE.upiId.trim()}</p>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--landing-foreground)]/20 bg-white px-4 font-medium transition-colors hover:bg-[var(--landing-bg)]"
                      onClick={copyUpi}
                    >
                      {copied ? "Copied" : "Copy UPI ID"}
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[var(--landing-muted)]">
                  Payments are received by {SITE.upiPayeeName}, which runs
                  ImReady.
                </p>
                <p className="text-sm leading-relaxed">
                  Paid? Share your UTR and your problem next. We confirm within
                  24 hours.
                </p>

                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--landing-primary)] px-5 text-base font-medium text-white transition-colors hover:bg-[var(--landing-primary-hover)]"
                  onClick={() => {
                    setOpen(false);
                    const next = `#${SITE.shareProblemHash}`;
                    if (window.location.hash !== next) {
                      window.history.pushState(
                        { imreadyShare: true },
                        "",
                        next
                      );
                      window.dispatchEvent(new Event("hashchange"));
                    }
                  }}
                >
                  I&apos;ve paid — Let&apos;s proceed
                </button>
              </div>
            ) : null}

            {paymentUrl ? (
              <p className="text-sm leading-relaxed">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  {upiReady
                    ? "Or use the payment page"
                    : "Pay ₹449 on the payment page"}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

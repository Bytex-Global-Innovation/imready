"use client";

import { useEffect, useId, useState } from "react";
import { Menu, X } from "@/components/icons";
import { NAV_LINKS, SITE } from "@/constants/founder-landing";
import ReserveCta from "@/components/landing/reserve-cta";
import TalkToUs from "@/components/landing/talk-to-us";

function goToSection(href: string) {
  const id = href.startsWith("#") ? href.slice(1) : href;
  if (!id) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
  const targetHash = `#${id}`;

  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
  }

  if (window.location.hash !== targetHash) {
    window.history.pushState(null, "", targetHash);
  }
}

function onSectionClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  href: string
) {
  event.preventDefault();
  goToSection(href);
}

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function closeAndGo(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    onSectionClick(event, href);
    setMenuOpen(false);
  }

  return (
    <header
      id="top"
      className="sticky top-0 z-40 bg-[var(--landing-bg)] px-3 pt-3 sm:px-6"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-nowrap items-center justify-between gap-3 rounded-full border border-[var(--landing-border)] bg-white/95 px-4 py-2 shadow-sm sm:gap-4 sm:px-6">
          <a
            href="#top"
            className="shrink-0 leading-none"
            onClick={(event) => onSectionClick(event, "#top")}
          >
            <span className="block font-[family-name:var(--font-landing-display)] text-xl font-semibold tracking-tight text-[var(--landing-foreground)]">
              {SITE.name}
            </span>
          </a>

          <nav
            aria-label="On this page"
            className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex lg:gap-5"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-[var(--landing-foreground)]/70 underline-offset-4 transition-colors hover:text-[var(--landing-foreground)] hover:underline"
                onClick={(event) => onSectionClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ReserveCta
              placement="header"
              showReassurance={false}
              showPendingNote={false}
            />
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--landing-foreground)]/15 bg-white text-[var(--landing-foreground)] transition-colors hover:bg-[var(--landing-bg)] md:size-11 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="landing-mobile-menu">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/20 supports-backdrop-filter:backdrop-blur-xs"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute top-0 right-0 flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-xl ring-1 ring-[var(--landing-foreground)]/10"
          >
            <div className="flex items-center justify-between border-b border-[var(--landing-border)] px-5 py-4">
              <p
                id={titleId}
                className="font-[family-name:var(--font-landing-display)] text-lg font-semibold tracking-tight text-[var(--landing-foreground)]"
              >
                Menu
              </p>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-lg text-[var(--landing-muted)] transition-colors hover:bg-[var(--landing-bg)] hover:text-[var(--landing-foreground)]"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="On this page" className="flex flex-1 flex-col p-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-base font-medium text-[var(--landing-foreground)] transition-colors hover:bg-[var(--landing-bg)]"
                  onClick={(event) => closeAndGo(event, link.href)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="border-t border-[var(--landing-border)] p-5">
              <TalkToUs />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

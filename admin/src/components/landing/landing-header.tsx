import Link from "next/link";
import { NAV_LINKS, SITE } from "@/constants/founder-landing";
import ReserveCta from "@/components/landing/reserve-cta";

export default function LandingHeader() {
  return (
    <header
      id="top"
      className="sticky top-0 z-40 bg-[var(--landing-bg)] px-3 pt-3 sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-nowrap items-center justify-between gap-2 rounded-full border border-[var(--landing-border)] bg-white/95 px-3 py-2 shadow-sm sm:gap-3 sm:px-5">
          <a href="#top" className="shrink-0 leading-none">
            <span className="block font-[family-name:var(--font-landing-display)] text-xl font-medium tracking-tight text-[var(--landing-foreground)]">
              {SITE.name}
            </span>
          </a>

          <nav
            aria-label="On this page"
            className="hidden min-w-0 items-center justify-center gap-4 xl:flex xl:gap-5"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-[var(--landing-foreground)]/80 underline-offset-4 transition-colors hover:text-[var(--landing-foreground)] hover:underline"
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
            <Link
              href="/login"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[var(--landing-foreground)]/20 bg-white px-3 text-sm font-medium text-[var(--landing-foreground)] transition-colors hover:bg-[var(--landing-bg)] md:h-11 md:px-5 md:text-base"
            >
              Login
            </Link>
          </div>
        </div>

        <nav
          aria-label="On this page"
          className="hidden flex-wrap gap-x-4 pb-1 md:flex xl:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex h-11 items-center text-sm font-medium text-[var(--landing-foreground)]/80"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

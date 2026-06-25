"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS, ROUTES, SITE_CONFIG } from "@/constants";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link href={ROUTES.home} className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-brand-600"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 8.5L4.21 7 12 3.5 19.79 7 12 10.5zm0 2.5l10-5v6l-10 5-10-5v-6l10 5z" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold text-brand-700">
        {SITE_CONFIG.name}
      </span>
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Logo />

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <Button variant="ghost" size="sm" href={ROUTES.login}>
            Log In
          </Button>
          <Button size="sm" href={ROUTES.signup}>
            Apply Now
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-border bg-white lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <ul className="space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-border px-4 py-4">
          <Button variant="secondary" href={ROUTES.login} className="w-full">
            Log In
          </Button>
          <Button href={ROUTES.signup} className="w-full">
            Apply Now
          </Button>
        </div>
      </div>
    </header>
  );
}

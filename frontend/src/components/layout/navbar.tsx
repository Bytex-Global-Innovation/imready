"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, ROUTES, SITE_CONFIG } from "@/constants";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link
      href={ROUTES.home}
      className="flex min-w-0 cursor-pointer items-center"
    >
      <Image
        src="/imready_logo.jpeg"
        alt={`${SITE_CONFIG.name} logo`}
        width={120}
        height={40}
        className="h-8 w-auto shrink-0 object-contain sm:h-9"
        priority
      />
    </Link>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] bg-hero px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <nav
          className="relative z-[100] mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-border bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-2.5"
          aria-label="Main navigation"
        >
        <Logo />

        <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex lg:gap-4">
          <Button variant="ghost" size="sm" href={ROUTES.login}>
            Log In
          </Button>
          <Button size="sm" href={ROUTES.signupStep(1)}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-muted hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
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
          "mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-border bg-white/95 shadow-sm backdrop-blur-sm lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <ul className="space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="block cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
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
          <Button href={ROUTES.signupStep(1)} className="w-full">
            Get Started
          </Button>
        </div>
      </div>
      </header>
      <div className="h-[5.5rem] shrink-0 bg-hero sm:h-[5.75rem]" aria-hidden="true" />
    </>
  );
}

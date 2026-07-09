import Link from "next/link";
import { FOOTER_LINKS, ROUTES, SITE_CONFIG } from "@/constants";
import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "default" | "hero";
}

export function Footer({ variant = "default" }: FooterProps) {
  const isHero = variant === "hero";

  return (
    <footer
      id="contact"
      className={cn(
        "border-t",
        isHero ? "border-border/60 bg-hero" : "border-border bg-surface",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link
              href={ROUTES.home}
              className={cn(
                "cursor-pointer font-display text-xl font-bold",
                isHero ? "text-hero-heading" : "text-brand-700",
              )}
            >
              {SITE_CONFIG.name}
            </Link>
            <p
              className={cn(
                "text-sm leading-relaxed",
                isHero ? "text-hero-body" : "text-muted",
              )}
            >
              {SITE_CONFIG.tagline}
            </p>
            <p className={cn("text-xs", isHero ? "text-hero-body" : "text-muted")}>
              {SITE_CONFIG.copyright}
            </p>
          </div>

          <div>
            <h3
              className={cn(
                "mb-4 text-sm font-semibold",
                isHero ? "text-hero-heading" : "text-foreground",
              )}
            >
              Platform
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "cursor-pointer text-sm transition-colors",
                      isHero
                        ? "text-hero-body hover:text-hero-heading"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "mb-4 text-sm font-semibold",
                isHero ? "text-hero-heading" : "text-foreground",
              )}
            >
              Programs
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.programs.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "cursor-pointer text-sm transition-colors",
                      isHero
                        ? "text-hero-body hover:text-hero-heading"
                        : "text-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "mb-4 text-sm font-semibold",
                isHero ? "text-hero-heading" : "text-foreground",
              )}
            >
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className={cn(
                    "cursor-pointer text-sm transition-colors",
                    isHero
                      ? "text-hero-body hover:text-hero-heading"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-2 text-sm transition-colors",
                    isHero
                      ? "text-hero-body hover:text-hero-heading"
                      : "text-muted hover:text-foreground",
                  )}
                  aria-label="IMReady on LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-8",
            isHero ? "border-border/60" : "border-border",
          )}
        >
          <div className="flex flex-wrap gap-6">
            {FOOTER_LINKS.platform.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "cursor-pointer text-sm transition-colors",
                  isHero
                    ? "text-hero-body hover:text-hero-heading"
                    : "text-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className={cn("text-sm", isHero ? "text-hero-body" : "text-muted")}>
            {SITE_CONFIG.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

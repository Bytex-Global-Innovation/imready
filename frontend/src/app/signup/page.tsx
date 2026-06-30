import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/features/signup";
import { ROUTES, SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `Join ${SITE_CONFIG.name} — Start Your Journey`,
  description:
    "Create your IMReady account and start building real industry experience before Semester 3.",
};

function SignupLogo() {
  return (
    <Link
      href={ROUTES.home}
      className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
    >
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

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border/60 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-2xl justify-center sm:justify-start">
          <SignupLogo />
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <SignupForm />
      </main>
    </div>
  );
}

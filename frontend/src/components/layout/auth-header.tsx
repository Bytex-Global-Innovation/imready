import Link from "next/link";
import { ROUTES, SITE_CONFIG } from "@/constants";

export function AuthHeader() {
  return (
    <header className="border-b border-border/60 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-3xl justify-center sm:justify-start">
        <Link
          href={ROUTES.home}
          className="inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e4d8f] to-[#153a75]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 8.5L4.21 7 12 3.5 19.79 7 12 10.5zm0 2.5l10-5v6l-10 5-10-5v-6l10 5z" />
            </svg>
          </span>
          <span className="font-display text-xl font-bold text-[#153a75]">
            {SITE_CONFIG.name}
          </span>
        </Link>
      </div>
    </header>
  );
}

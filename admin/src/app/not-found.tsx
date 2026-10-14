import Link from "next/link";
import { LayoutDashboard } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-admin-bg">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(21,58,117,0.08)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(21,58,117,0.05)_0%,_transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-admin-primary">
          <span className="text-xl font-bold text-white">IR</span>
        </div>

        <p className="text-sm font-semibold tracking-[0.18em] text-admin-primary uppercase">
          Admin Portal
        </p>

        <p
          className="mt-4 text-[5.5rem] leading-none font-bold tracking-tight text-admin-primary/15 sm:text-[7rem]"
          aria-hidden
        >
          404
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-admin-text-muted sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Return to the dashboard to continue managing the platform.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="admin-btn-primary gap-2 px-5 py-2.5">
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link href="/" className="admin-btn-outline px-5 py-2.5">
            Go to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

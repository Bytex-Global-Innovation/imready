import { Home } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

export function NotFoundView() {
  return (
    <>
      <main className="relative flex min-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden bg-hero sm:min-h-[calc(100dvh-5.75rem)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--brand-100)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_var(--surface)_0%,_transparent_45%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            {SITE_CONFIG.name}
          </p>

          <p
            className="mt-4 font-display text-[5.5rem] leading-none font-bold tracking-tight text-primary/15 sm:text-[7rem] lg:text-[8.5rem]"
            aria-hidden
          >
            404
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            Page not found
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
            Let&apos;s get you back on your career readiness journey.
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Button href={ROUTES.home} size="lg" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
            <Button
              href={ROUTES.login}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </main>
      <Footer variant="hero" />
    </>
  );
}

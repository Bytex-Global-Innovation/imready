import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-4 pt-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] bg-primary px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Start today. Your first project is waiting.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          Join for free today and get your first industry project and mentor.
        </p>
        <Button
          variant="secondary"
          size="lg"
          href={ROUTES.signup}
          className="mt-6 text-primary"
        >
          Start today
        </Button>
      </div>
    </section>
  );
}
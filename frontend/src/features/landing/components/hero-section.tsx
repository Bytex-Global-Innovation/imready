import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { JourneyCard } from "./journey-card";

const HERO_HIGHLIGHTS = [
  "6–8 hrs per week",
  "Mentor-reviewed work",
  "Real industry briefs",
] as const;

export function HeroSection() {
  return (
    <section className="overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:py-18">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div className="lg:max-w-[560px]">
            <h1 className="font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-hero-heading sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
              Graduate With experience, not Just a degree.
            </h1>

            <p className="mt-5 text-base leading-[1.7] text-hero-body sm:text-lg">
              Bridge the gap between what you learn and what the industry expects.
              ImReady connects students with practical projects, industry mentors, and
              portfolio-building experiences that transform academic knowledge into
              job-ready skills.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2.5">
              {HERO_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm"
                >
                  {item}
                </li>
              ))}
            </ul>

            <Button size="lg" href={ROUTES.signup} className="mt-6">
              Start My Industry Journey
            </Button>

            <p className="mt-4 text-sm font-medium text-primary">
              Join for free today and get your first industry project and mentor review.
            </p>
          </div>

          <div className="min-w-0"> 
            <JourneyCard />
          </div>
        </div>
      </div>
    </section>
  );
}
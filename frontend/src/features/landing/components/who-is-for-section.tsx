import Image from "next/image";
import { ChevronDown } from "@/components/icons";
import { WHO_IS_FOR_AUDIENCES, WHO_IS_FOR_SECTION } from "@/constants/landing";

export function WhoIsForSection() {
  return (
    <section id="who-is-it-for" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold tracking-widest text-hero-accent uppercase shadow-sm">
            {WHO_IS_FOR_SECTION.eyebrow}
          </p>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            {WHO_IS_FOR_SECTION.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            {WHO_IS_FOR_SECTION.description}
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHO_IS_FOR_AUDIENCES.map((audience) => (
            <li
              key={audience.title}
              className="flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-100">
                <Image
                  src={audience.imageSrc}
                  alt={audience.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              <h3 className="mt-4 font-display text-base font-bold text-hero-heading">
                {audience.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-hero-body">
                {audience.description}
              </p>
              <span className="mt-4 inline-block w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                {audience.tag}
              </span>
            </li>
          ))}
        </ul>

        <a
          href="#journey"
          aria-label="Scroll to your journey"
          className="mx-auto mt-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-hero-body shadow-sm transition-colors hover:text-primary"
        >
          <ChevronDown className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
import Image from "next/image";
import {
  ACADEMIC_MENTORS,
  MENTORSHIP_SECTION,
  SUCCESSFUL_EXPLORERS,
  type MentorshipPerson,
} from "@/constants/landing";

function PersonCard({ person }: { person: MentorshipPerson }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative aspect-square">
        <Image
          src={person.imageSrc}
          alt={person.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-4 text-center">
        <p className="font-display text-base font-bold text-hero-heading">
          {person.name}
        </p>
        <p className="mt-1 text-sm text-hero-body">{person.role}</p>
      </div>
    </article>
  );
}

export function MentorshipSection() {
  return (
    <section id="mentorship" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-hero-accent">
            {MENTORSHIP_SECTION.eyebrow}
          </p>

          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-hero-heading sm:text-4xl lg:text-5xl">
            {MENTORSHIP_SECTION.title}{" "}
            <span className="text-hero-accent">
              {MENTORSHIP_SECTION.titleAccent}
            </span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-hero-body sm:text-lg">
            {MENTORSHIP_SECTION.description}
          </p>
        </div>

        <div className="mt-12 rounded-3xl bg-surface-alt p-6 sm:mt-16 sm:p-10 lg:p-12">
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold text-hero-accent sm:text-3xl">
              {MENTORSHIP_SECTION.academicMentorsTitle}
            </h3>
            <p className="mt-2 text-sm text-hero-body sm:text-base">
              {MENTORSHIP_SECTION.academicMentorsSubtitle}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {ACADEMIC_MENTORS.map((mentor) => (
              <PersonCard key={mentor.name} person={mentor} />
            ))}
          </div>

          <div className="mt-14 text-center sm:mt-16">
            <h3 className="font-display text-2xl font-bold text-hero-heading sm:text-3xl">
              {MENTORSHIP_SECTION.successfulExplorersTitle}
            </h3>
            <p className="mt-2 text-sm text-hero-body sm:text-base">
              {MENTORSHIP_SECTION.successfulExplorersSubtitle}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {SUCCESSFUL_EXPLORERS.map((explorer) => (
              <PersonCard key={explorer.name} person={explorer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
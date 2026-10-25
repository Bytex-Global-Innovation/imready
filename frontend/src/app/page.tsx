import { Footer } from "@/components/layout/footer";
import { FaqSection } from "@/features/landing/components/faq-section";
import { GapSection } from "@/features/landing/components/gap-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { JourneyMapSection } from "@/features/landing/components/journey-map-section";
import { MentorshipSection } from "@/features/landing/components/mentorship-section";
import { ProjectShowcaseSection } from "@/features/landing/components/project-showcase-section";
import { SectionDivider } from "@/features/landing/components/section-divider";
import { CtaSection } from "@/features/landing/components/cta-section";

export default function HomePage() {
  return (
    <>
      <main className="bg-hero">
        <HeroSection />
        <SectionDivider />
        <GapSection />
        <SectionDivider />
        <JourneyMapSection />
        <SectionDivider />
        <MentorshipSection />
        <SectionDivider />
        <ProjectShowcaseSection />
        <SectionDivider />
        <FaqSection />

                

        <CtaSection />
      </main>
      
      <Footer variant="hero" />
    </>
  );
}
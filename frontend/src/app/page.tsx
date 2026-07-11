import { Navbar, Footer } from "@/components/layout";
import {
  FaqSection,
  GapSection,
  HeroSection,
  JourneyMapSection,
  ProjectShowcaseSection,
  SectionDivider,
} from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-hero">
        <HeroSection />
        <SectionDivider />
        <GapSection />
        <SectionDivider />
        <JourneyMapSection />
        <SectionDivider />
        <ProjectShowcaseSection />
        <SectionDivider />
        <FaqSection />
      </main>
      <Footer variant="hero" />
    </>
  );
}

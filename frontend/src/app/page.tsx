import { Navbar, Footer } from "@/components/layout";
import {
  DeviceSelectionSection,
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
        <DeviceSelectionSection />
        <SectionDivider />
        <ProjectShowcaseSection />
        <SectionDivider />
        <FaqSection />
      </main>
      <Footer variant="hero" />
    </>
  );
}

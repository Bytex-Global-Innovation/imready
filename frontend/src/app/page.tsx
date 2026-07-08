import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  HowItWorksSection,
  ProjectShowcaseSection,
  WhyChooseSection,
  AdvantageSection,
} from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ProjectShowcaseSection />
        <WhyChooseSection />
        <AdvantageSection />
      </main>
      <Footer />
    </>
  );
}

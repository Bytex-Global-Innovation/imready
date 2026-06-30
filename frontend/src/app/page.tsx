import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  HowItWorksSection,
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
        <WhyChooseSection />
        <AdvantageSection />
      </main>
      <Footer />
    </>
  );
}

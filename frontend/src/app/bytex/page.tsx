import { Navbar, Footer } from "@/components/layout";
import {
  BytexHeroSection,
  HowBytexWorksSection,
  EligibleDevicesSection,
  BytexFaqSection,
} from "@/features/bytex";

export default function BytexPage() {
  return (
    <>
      <Navbar />
      <main className="bg-hero">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16 lg:gap-16 lg:px-8">
          <BytexHeroSection />
          <HowBytexWorksSection />
          <EligibleDevicesSection />
          <BytexFaqSection />
        </div>
      </main>
      <Footer variant="hero" />
    </>
  );
}

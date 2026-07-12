import { Footer } from "@/components/layout/footer";
import { BytexHeroSection } from "@/features/bytex/components/bytex-hero-section";
import { HowBytexWorksSection } from "@/features/bytex/components/how-bytex-works-section";
import { EligibleDevicesSection } from "@/features/bytex/components/eligible-devices-section";
import { BytexFaqSection } from "@/features/bytex/components/bytex-faq-section";

export default function BytexPage() {
  return (
    <>
      <main className="bg-hero">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16 lg:gap-16 lg:px-8">
          <BytexHeroSection />
          <HowBytexWorksSection />
          <EligibleDevicesSection />
          <BytexFaqSection />
        </div>
      </main>
      <Footer />
    </>
  );
}

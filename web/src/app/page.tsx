import { CtaSection } from "@/components/landing/cta-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InFocusCarousel } from "@/components/landing/in-focus-carousel";
import { LiveTicker } from "@/components/landing/live-ticker";
import { ModulesShowcase } from "@/components/landing/modules-showcase";
import { TrustSection } from "@/components/landing/trust-section";

export default function Home() {
  return (
    <div>
      <Hero />
      <LiveTicker />
      <ModulesShowcase />
      <InFocusCarousel />
      <HowItWorks />
      <TrustSection />
      <CtaSection />
    </div>
  );
}

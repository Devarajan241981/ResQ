import { AwarenessCarousel } from "@/components/landing/awareness-carousel";
import { CtaSection } from "@/components/landing/cta-section";
import { ExploreSection } from "@/components/landing/explore-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InFocusCarousel } from "@/components/landing/in-focus-carousel";
import { InformationCategories } from "@/components/landing/information-categories";
import { LiveTicker } from "@/components/landing/live-ticker";
import { ModulesShowcase } from "@/components/landing/modules-showcase";
import { NewsSpotlight } from "@/components/landing/news-spotlight";
import { OnlineServices } from "@/components/landing/online-services";
import { StatsStrip } from "@/components/landing/stats-strip";
import { TrendingSection } from "@/components/landing/trending-section";
import { TrustSection } from "@/components/landing/trust-section";

export default function Home() {
  return (
    <div>
      <Hero />
      <StatsStrip />
      <LiveTicker />
      <OnlineServices />
      <InformationCategories />
      <ModulesShowcase />
      <NewsSpotlight />
      <TrendingSection />
      <AwarenessCarousel />
      <ExploreSection />
      <InFocusCarousel />
      <HowItWorks />
      <TrustSection />
      <CtaSection />
    </div>
  );
}

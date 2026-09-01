import type { Metadata } from "next";
import { AboutContent } from "@/components/about-content";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "About — ResQ Bharath",
  description: "The mission, principles, and roadmap behind ResQ Bharath's emergency community platform.",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <AboutContent />
    </PageContainer>
  );
}

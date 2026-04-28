import { HeroSection } from "@/components/home/HeroSection";
import { CoreStrengths } from "@/components/home/CoreStrengths";
import { InstrumentGallery } from "@/components/home/InstrumentGallery";
import { TechMetrics } from "@/components/home/TechMetrics";
import { TeamShowcase } from "@/components/home/TeamShowcase";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CoreStrengths />
      <InstrumentGallery />
      <TechMetrics />
      <TeamShowcase />
      <Footer />
    </main>
  );
}

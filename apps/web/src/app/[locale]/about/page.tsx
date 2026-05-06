import { Suspense } from "react";
import AboutHeroHeader from "@/components/about/AboutHeroHeader";
import AboutTabContent from "@/components/about/AboutTabContent";
import { Footer } from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <main>
      <AboutHeroHeader />
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <AboutTabContent />
      </Suspense>
      <Footer />
    </main>
  );
}
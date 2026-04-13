"use client";

import { useRef } from "react";
import FAQSection from "@/src/components/FAQSection";
import FeatureGrid from "@/src/components/FeatureGrid";
import FeatureRow from "@/src/components/FeatureRow";
import Footer from "@/src/components/Footer";
import HeroSection from "@/src/components/HeroSection";
import Navbar from "@/src/components/Navbar";
import ScrollColorTransition from "@/src/components/ScrollColorTransition";
import WaitlistCTA from "@/src/components/WaitlistCTA";
import WhySection from "@/src/components/WhySection";

export function WaitlistHome() {
  const heroFormRef = useRef<HTMLDivElement | null>(null);

  function scrollToForm() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      const input = heroFormRef.current?.querySelector("input");
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 600);
  }

  return (
    <div className="min-h-screen">
      <Navbar onJoinClick={scrollToForm} />
      <HeroSection formRef={heroFormRef} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <ScrollColorTransition>
          <FeatureRow />
        </ScrollColorTransition>
        <WhySection />
        <FeatureGrid />
        <WaitlistCTA />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import PricingSection from "@/components/landing/pricing-section";
import FounderSection from "@/components/landing/founder-section";
import FaqSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";
import PlatformCapabilitiesSection from "@/components/landing/platform-capabilities-section";
import { RegisterModal } from "@/components/landing/register-modal";

export default function LandingPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  return (
    <>
      <Navbar onRegisterClick={() => setIsRegisterModalOpen(true)} />
      <main className="overflow-x-hidden md:px-[6%] space-y-2">
        <HeroSection />
        <StatsSection />
        <PricingSection />
        <PlatformCapabilitiesSection />
        <HowItWorksSection />
        <FounderSection />
        <FaqSection />
      </main>
      <Footer />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
}

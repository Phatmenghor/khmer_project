"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { ROUTES } from "@/constants/app-routes/routes";
import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import PricingSection, { PlanData } from "@/components/landing/pricing-section";
import FounderSection from "@/components/landing/founder-section";
import FaqSection from "@/components/landing/faq-section";
import Footer from "@/components/landing/footer";
import PlatformCapabilitiesSection from "@/components/landing/platform-capabilities-section";
import { RegisterModal } from "@/components/landing/register-modal";
import { LoginModal } from "@/components/landing/login-modal";
import { PlanUpgradePaymentModal } from "@/features/subscription/components/plan-upgrade-payment-modal";

export default function LandingPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);

  const router = useRouter();
  const { isLoggedIn, profile } = useAuthState();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, []);

  const handleSelectPlan = (plan: PlanData) => {
    if (isLoggedIn) {
      const numericPrice = typeof plan.price === "number"
        ? plan.price
        : parseFloat(String(plan.price || "0").replace(/[^0-9.]/g, "")) || 0;

      setSelectedPlanForUpgrade({
        id: plan.id,
        name: plan.name,
        price: numericPrice,
        durationType: plan.durationType || "MONTHLY",
        description: plan.description,
      });
      setIsPaymentModalOpen(true);
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const handleLoginClick = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <Navbar
        onLoginClick={handleLoginClick}
      />
      <main className="overflow-x-hidden md:px-[6%] space-y-2">
        <HeroSection />
        <StatsSection />
        <PricingSection onSelectPlan={handleSelectPlan} />
        <PlatformCapabilitiesSection />
        <HowItWorksSection />
        <FounderSection />
        <FaqSection />
      </main>
      <Footer />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <PlanUpgradePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlanForUpgrade}
        userProfile={profile}
      />
    </>
  );
}

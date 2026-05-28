import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import PricingSection from "@/components/landing/pricing-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import FounderSection from "@/components/landing/founder-section";
import FaqSection from "@/components/landing/faq-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "EMenu Cambodia — Full Digital Platform for Every Business",
  description:
    "EMenu Cambodia gives restaurants, cafés, and food businesses QR menus, real-time POS, e-commerce, Telegram bot, live tracking, and analytics — all free. Built for Cambodia.",
  keywords: [
    "digital menu Cambodia",
    "QR code menu",
    "POS system Cambodia",
    "e-commerce Cambodia",
    "restaurant management",
    "EMenu Cambodia",
    "Khmer business platform",
  ],
  openGraph: {
    title: "EMenu Cambodia — Full Digital Platform for Every Business",
    description:
      "QR menus, POS, e-commerce, Telegram bot, and analytics — all in one platform. Free for businesses across Cambodia.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FounderSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

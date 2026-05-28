import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero-section";
import StatsSection from "@/components/landing/stats-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import PricingSection from "@/components/landing/pricing-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import FaqSection from "@/components/landing/faq-section";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export const metadata = {
  title: "eMenu — Smart Digital Menus for Restaurants",
  description:
    "Boost sales, reduce wait times, and delight guests with QR code ordering, real-time management, and powerful analytics — all in one platform. Trusted by 500+ restaurants in Cambodia.",
  keywords: [
    "digital menu",
    "QR code ordering",
    "restaurant management",
    "Cambodia",
    "eMenu",
  ],
  openGraph: {
    title: "eMenu — Smart Digital Menus for Restaurants",
    description:
      "QR code ordering, real-time analytics, and powerful tools for Cambodia's restaurants.",
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
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

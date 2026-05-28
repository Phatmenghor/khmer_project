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
  title: "EMenu Cambodia — Smart Digital Menus for Restaurants",
  description:
    "EMenu Cambodia helps restaurants go paperless with QR code menus, real-time order management, and powerful analytics. Trusted by 500+ restaurants across Cambodia.",
  keywords: [
    "digital menu",
    "QR code ordering",
    "restaurant management",
    "Cambodia",
    "EMenu Cambodia",
    "Khmer restaurant",
  ],
  openGraph: {
    title: "EMenu Cambodia — Smart Digital Menus for Restaurants",
    description:
      "QR code menus, real-time analytics, and powerful tools for Cambodia's restaurants. Setup in under an hour.",
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

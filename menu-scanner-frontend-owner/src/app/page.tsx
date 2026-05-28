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
  title: "EMenu Platform — Professional SaaS for Food & Hospitality Businesses",
  description:
    "Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, and global payment processing. Everything restaurant owners need to compete globally and scale their business.",
  keywords: [
    "digital menu platform",
    "QR code menu system",
    "POS system software",
    "restaurant management platform",
    "food business software",
    "online ordering system",
    "customer loyalty program",
    "restaurant analytics",
    "multi-location management"
  ],
  openGraph: {
    title: "EMenu Platform — Professional SaaS for Food & Hospitality Businesses",
    description:
      "Complete platform with QR menus, POS, real-time orders, loyalty programs, analytics, and global support. Free 30-day trial.",
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

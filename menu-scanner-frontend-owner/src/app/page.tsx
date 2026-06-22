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
import { ScrollToTop } from "@/components/landing/scroll-to-top";

export const metadata = {
  title: "ScanMeKH — Transform Your Restaurant Into a Digital Powerhouse",
  description:
    "Professional restaurant management platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, and payment processing. Everything restaurant owners need to succeed.",
  keywords: [
    "ScanMeKH",
    "digital menu platform",
    "QR code menu system",
    "POS system software",
    "restaurant management platform",
    "food business software",
    "online ordering system",
    "customer loyalty program",
    "restaurant analytics"
  ],
  openGraph: {
    title: "ScanMeKH — Transform Your Restaurant Into a Digital Powerhouse",
    description:
      "Complete restaurant platform with QR menus, POS, real-time orders, loyalty programs, analytics. Free trial available.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden md:px-[8%]">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FounderSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

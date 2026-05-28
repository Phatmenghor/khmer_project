"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const scrollStyles = `
  @keyframes scroll-bounce-updown {
    0% { transform: translateY(-10px); }
    50% { transform: translateY(10px); }
    100% { transform: translateY(-10px); }
  }

  .scroll-indicator {
    animation: scroll-bounce-updown 2s ease-in-out infinite;
  }
`;

export default function HeroSection() {
  return (
    <>
      <style>{scrollStyles}</style>
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "4s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s", animationDelay: "1s"}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/3 to-white"></div>
      </div>

      <div className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
            <FadeIn direction="right" delay={0}>
              <div className="flex flex-col justify-start h-full space-y-8 sm:space-y-10">
                {/* Headline */}
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent">
                    Transform Your Business
                    <br />
                    Into a Digital Powerhouse
                  </h1>
                </div>

                {/* Subheadline */}
                <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl font-medium tracking-wide">
                  Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, and global payment processing.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-4">
                  {[
                    "Free trial included",
                    "Full feature access",
                    "No credit card needed",
                    "24/7 global support",
                    "Auto-scaling infrastructure",
                    "GDPR & compliance ready"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 group" style={{animationDelay: `${i * 50}ms`}}>
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl group-hover:scale-110 transition-all"></div>
                        <CheckCircle className="w-6 h-6 text-primary relative z-10" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-8">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-4 text-base sm:text-lg rounded-2xl group shadow-lg hover:shadow-2xl transition-all font-semibold"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </Button>
                  <Button size="lg" className="px-8 py-4 text-base sm:text-lg rounded-2xl border-2 border-primary/30 bg-white text-primary hover:bg-primary/5 hover:border-primary/50 font-semibold transition-all" asChild>
                    <Link href="/">Schedule Demo</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Mobile App Image - Right side */}
            <FadeIn direction="left" delay={100}>
              <div className="relative h-auto min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl group">
                <Image
                  src="/images/hero/mobile-restaurant.jpg"
                  alt="Emenu Cambodia Mobile App"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Scroll to explore</p>
          <ChevronDown className="w-5 h-5 text-primary scroll-indicator" />
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

const typewriterStyles = `
  @keyframes typewriter {
    0% { width: 0; }
    100% { width: 100%; }
  }

  @keyframes blink {
    0%, 49% { border-right-color: transparent; }
    50%, 100% { border-right-color: currentColor; }
  }

  @keyframes scroll-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
  }

  .typewriter {
    overflow: hidden;
    white-space: nowrap;
    animation: typewriter 3.5s steps(40, end) forwards, blink 0.75s step-end infinite 3.5s;
    border-right: 2px solid;
    border-right-color: currentColor;
  }

  .scroll-indicator {
    animation: scroll-bounce 2s infinite;
  }
`;

export default function HeroSection() {
  return (
    <>
      <style>{typewriterStyles}</style>
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "4s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s", animationDelay: "1s"}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/3 to-white"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
            <FadeIn direction="right" delay={0}>
              <div className="space-y-6 sm:space-y-8 flex flex-col justify-center">
              {/* Headline with Typewriter Effect */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-slate-900">
                <span className="typewriter inline-block" style={{animationDelay: "0.3s"}}>Transform Your Business</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse" style={{animationDelay: "3.8s"}}>Into a Digital Powerhouse</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed max-w-2xl font-medium">
              Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing.
            </p>

            {/* Features as animated cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6 sm:pt-8 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-primary/20 backdrop-blur-sm">
              {[
                "30-day free trial",
                "Full feature access",
                "No credit card needed",
                "24/7 global support",
                "Auto-scaling infrastructure",
                "GDPR & compliance ready"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 group cursor-pointer" style={{animationDelay: `${i * 50}ms`}}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-primary flex-shrink-0 relative z-10 animate-scale-in" style={{animationDelay: `${i * 50}ms`}} />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg rounded-xl sm:rounded-2xl group w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg rounded-xl sm:rounded-2xl border-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 w-full sm:w-auto font-semibold transition-all" asChild>
                <a href="#features">Schedule Demo</a>
              </Button>
            </div>
            </div>
          </FadeIn>

            {/* Mobile App Image - Right side */}
            <FadeIn direction="left" delay={100}>
              <div className="relative h-full min-h-[500px] lg:min-h-[650px] rounded-3xl overflow-hidden shadow-2xl group">
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

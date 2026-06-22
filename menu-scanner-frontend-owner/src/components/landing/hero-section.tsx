"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";
import { LANDING_CONFIG } from "@/constants/landing-config";
import { appImages } from "@/constants/app-resource/icons/app-images";

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
      <section className="relative overflow-hidden pt-11 sm:pt-16 pb-14 sm:pb-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-44 sm:w-64 h-44 sm:h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "4s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-44 sm:w-64 h-44 sm:h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s", animationDelay: "1s"}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/3 to-white"></div>
      </div>

      <div className="max-w-[1330px] mx-auto px-3 sm:px-4 lg:px-5">
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-11 items-stretch">
            <FadeIn direction="right" delay={0}>
              <div className="flex flex-col justify-start h-full space-y-5 sm:space-y-7">
                {/* Headline */}
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent">
                    {LANDING_CONFIG.hero.headline}
                  </h1>
                </div>

                {/* Subheadline */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-medium tracking-wide">
                  {LANDING_CONFIG.hero.subheadline}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3 pt-3">
                  {LANDING_CONFIG.hero.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 group" style={{animationDelay: `${i * 50}ms`}}>
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl group-hover:scale-110 transition-all"></div>
                        <CheckCircle className="w-4 h-4 text-primary relative z-10" />
                      </div>
                      <span className="text-xs sm:text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-5">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-5 py-3 text-sm rounded group shadow-lg hover:shadow-2xl transition-all font-semibold"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {LANDING_CONFIG.hero.primaryCTA}
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition" />
                  </Button>
                  <Button size="lg" className="px-5 py-3 text-sm rounded border-2 border-primary/30 bg-white text-primary hover:bg-primary/5 hover:border-primary/50 font-semibold transition-all" asChild>
                    <Link href="#how-it-works">{LANDING_CONFIG.hero.secondaryCTA}</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Mobile App Image - Right side */}
            <FadeIn direction="left" delay={100}>
              <div className="relative h-auto min-h-[450px] lg:min-h-[550px] rounded overflow-hidden shadow-2xl group">
                <Image
                  src={appImages.mobileRestaurant}
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
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
          <p className="text-xs sm:text-xs text-slate-500 font-medium">Scroll to explore</p>
          <ChevronDown className="w-3 h-3 text-primary scroll-indicator" />
        </div>
      </section>
    </>
  );
}

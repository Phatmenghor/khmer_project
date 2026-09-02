"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
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
                <div className="flex flex-col sm:flex-row gap-2.5 pt-4 sm:pt-5">
                  <CustomButton
                    variant="default"
                    className="h-[36px] px-4 text-xs font-semibold rounded-[12px] gap-1.5 shadow-2xs cursor-pointer"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {LANDING_CONFIG.hero.primaryCTA}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </CustomButton>
                  <CustomButton
                    variant="outline"
                    className="h-[36px] px-4 text-xs font-semibold rounded-[12px] cursor-pointer"
                    asChild
                  >
                    <Link href="#capabilities">{LANDING_CONFIG.hero.secondaryCTA}</Link>
                  </CustomButton>
                </div>
              </div>
            </FadeIn>

            {/* Mobile App Image Showcase */}
            <FadeIn direction="left" delay={100}>
              <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-[20px] border border-border/80 bg-card shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg">
                <Image
                  src={appImages.mobileRestaurant}
                  alt="ScanMeKH Mobile Digital Menu & Storefront Showcase"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-[14px] backdrop-blur-md bg-background/90 border border-border/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">ScanMeKH Digital Storefront</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Real-time QR menu & instant ordering</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full">
                      LIVE DEMO
                    </span>
                  </div>
                </div>
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

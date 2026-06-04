"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { LANDING_CONFIG } from "@/constants/landing-config";

export default function CtaSection() {
  const { cta } = LANDING_CONFIG;

  return (
    <section className="relative overflow-hidden py-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "8s", animationDelay: "2s"}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 text-center relative z-10">
        <FadeIn direction="up">
          <h2 className="text-xs sm:text-sm font-bold text-white leading-tight mb-4 drop-shadow-lg">
            {cta.subtitle}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
            <Button
              size="lg"
              className="h-10 px-7 text-xs gap-1 bg-white text-primary hover:bg-white/95 shadow-2xl font-bold border-0"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {cta.primaryCTA}
              <ArrowRight className="w-3 h-3" />
            </Button>
            <Button
              size="lg"
              className="h-10 px-7 text-xs bg-white/20 text-white hover:bg-white/30 border border-white/40 shadow-none font-semibold"
              asChild
            >
              <Link href="/">{cta.secondaryCTA}</Link>
            </Button>
          </div>

          <div className="mt-7">
            <p className="text-xs text-white/80 text-center">
              {cta.disclaimer}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

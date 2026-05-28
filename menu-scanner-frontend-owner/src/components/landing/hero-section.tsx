"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: "4s"}}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s", animationDelay: "1s"}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-primary/3 to-white"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="space-y-8 max-w-3xl">
            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">Professional Restaurant Management</span>
              </div>
              <h1 className="text-6xl sm:text-7xl font-bold leading-tight text-slate-900">
                Transform Your Restaurant
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent animate-pulse">Into a Digital Powerhouse</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl font-medium">
              Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing.
            </p>

            {/* Features as animated cards */}
            <div className="grid sm:grid-cols-2 gap-4 pt-8 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 rounded-3xl p-8 border-2 border-primary/20 backdrop-blur-sm">
              {[
                "30-day free trial",
                "Full feature access",
                "No credit card needed",
                "24/7 global support",
                "Auto-scaling infrastructure",
                "GDPR & compliance ready"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer" style={{animationDelay: `${i * 50}ms`}}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 relative z-10 animate-scale-in" style={{animationDelay: `${i * 50}ms`}} />
                  </div>
                  <span className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-8 py-4 text-lg rounded-2xl group w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button size="lg" className="px-8 py-4 text-lg rounded-2xl border-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 w-full sm:w-auto font-semibold transition-all" asChild>
                <a href="#features">Schedule Demo</a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

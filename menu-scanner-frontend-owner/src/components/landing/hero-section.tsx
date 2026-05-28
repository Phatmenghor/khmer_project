"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden pt-32 pb-20">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="space-y-8 max-w-3xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-fit">
              <span className="text-2xl">🌍</span>
              <span className="text-white/80 font-medium text-sm">Professional SaaS for Global Food & Hospitality</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl sm:text-7xl font-bold leading-tight">
              <span className="text-white">Transform Your Restaurant</span>
              <br />
              <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text">
                Into a Digital Powerhouse
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing. Everything restaurant owners need to compete globally and scale their business.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                "30-day free trial",
                "Full feature access",
                "No credit card needed",
                "24/7 global support",
                "Auto-scaling cloud infrastructure",
                "GDPR & compliance ready"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-7 text-lg rounded-xl group w-full sm:w-auto shadow-lg" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-7 text-lg rounded-xl border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
                <a href="#features">Schedule Demo</a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Colored bars at bottom */}
      <div className="relative z-10 mt-16 flex flex-col gap-0">
        <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600" />
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />
      </div>
    </section>
  );
}

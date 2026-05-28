"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="space-y-8 max-w-3xl">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-slate-900">
              Transform Your Restaurant
              <br />
              <span className="text-primary">Into a Digital Powerhouse</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl">
              Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing.
            </p>

            {/* Features as cards */}
            <div className="grid sm:grid-cols-2 gap-3 pt-6 bg-primary/5 rounded-2xl p-6 border border-primary/10">
              {[
                "30-day free trial",
                "Full feature access",
                "No credit card needed",
                "24/7 global support",
                "Auto-scaling infrastructure",
                "GDPR & compliance ready"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-800">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 animate-scale-in" style={{animationDelay: `${i * 50}ms`}} />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base rounded-xl group w-full sm:w-auto shadow-lg transition-all hover:shadow-xl" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-base rounded-xl border-2 border-primary/20 text-slate-900 hover:bg-primary/5 w-full sm:w-auto" asChild>
                <a href="#features">Schedule Demo</a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

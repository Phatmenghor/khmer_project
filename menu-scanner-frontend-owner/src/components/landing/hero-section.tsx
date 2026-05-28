"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/landing/fade-in";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" delay={0}>
          <div className="space-y-8 max-w-3xl">
            {/* Headline */}
            <h1 className="text-6xl sm:text-7xl font-bold leading-tight text-slate-900">
              Transform Your Restaurant
              <br />
              <span className="text-primary">Into a Digital Powerhouse</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-2xl">
              Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing. Everything restaurant owners need to compete globally and scale their business.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                "30-day free trial",
                "Full feature access",
                "No credit card needed",
                "24/7 global support",
                "Auto-scaling infrastructure",
                "GDPR & compliance ready"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-800">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-7 text-lg rounded-xl group w-full sm:w-auto shadow-md" asChild>
                <Link href={ROUTES.PUBLIC.REGISTER}>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-7 text-lg rounded-xl border-2 border-gray-300 text-slate-900 hover:bg-gray-50 w-full sm:w-auto" asChild>
                <a href="#features">Schedule Demo</a>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Colored bars at bottom */}
      <div className="mt-16 flex flex-col gap-0">
        <div className="h-1 bg-primary" />
        <div className="h-1 bg-primary/80" />
      </div>
    </section>
  );
}

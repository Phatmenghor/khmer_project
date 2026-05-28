"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";

const faqs = [
  {
    q: "What's included in the pricing plans?",
    a: "Every plan includes full access to all features: QR menus, POS system, order management, analytics, staff management, loyalty programs, and integrations. The free trial is 30 days with no credit card required.",
  },
  {
    q: "How long does setup take?",
    a: "Most restaurants go live in under one hour. Sign up, add your menu items, download your QR codes, and start taking orders. Our onboarding team guides you through every step.",
  },
  {
    q: "Do customers need to download an app?",
    a: "No app required. Customers scan the QR code with their phone camera and access the menu instantly in their browser. Works seamlessly on all smartphones — iOS and Android.",
  },
  {
    q: "Can I manage multiple restaurant locations?",
    a: "Yes! Professional and Enterprise plans support unlimited locations. Each location has its own menu, QR codes, and analytics, all managed from one central dashboard.",
  },
  {
    q: "What payment methods do you support?",
    a: "We integrate with major payment gateways worldwide including credit cards, mobile wallets, bank transfers, and cash. All transactions are PCI-compliant and secure.",
  },
  {
    q: "How is my data protected?",
    a: "Bank-level encryption, daily automatic backups, GDPR compliance, 99.99% uptime guarantee, and regular security audits. Your data is your priority and ours too.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="contact" className="relative py-24">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "6s"}}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: "7s", animationDelay: "2s"}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Questions Answered</span>
            </h2>
            <p className="text-lg text-slate-700 font-medium">
              Everything you need to know about Emenu Cambodia
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:border-primary/30 transition-colors">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left"
                >
                  <span className={cn(
                    "text-lg font-semibold pr-4",
                    open === i ? "text-primary" : "text-slate-900"
                  )}>
                    {q}
                  </span>
                  <ChevronDown className={cn(
                    "h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200",
                    open === i ? "rotate-180 text-primary" : ""
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  open === i ? "max-h-48" : "max-h-0"
                )}>
                  <div className="px-7 pb-6 text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";

const faqs = [
  {
    q: "Is EMenu Cambodia really free?",
    a: "Yes! All three plans — 1 Week, 1 Month, and 1 Year — are completely free during our launch period. We believe every Cambodian business deserves access to modern technology without financial barriers.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are fully set up in under an hour. Register your account, add your menu items, download your QR codes, and you're live. Our onboarding guide walks you through every step.",
  },
  {
    q: "Do my customers need to download an app?",
    a: "No app required. Guests simply point their phone camera at the QR code and the menu opens instantly in their browser. Works on all smartphones — Android or iPhone.",
  },
  {
    q: "Can I use EMenu Cambodia for multiple locations?",
    a: "Yes! The 1 Year plan supports multiple business locations, each with its own menu, QR codes, and analytics — all managed from one central dashboard.",
  },
  {
    q: "Is the menu available in Khmer?",
    a: "Absolutely. EMenu Cambodia fully supports both Khmer and English so you can serve local and international customers equally well.",
  },
  {
    q: "What happens after my plan expires?",
    a: "You can renew or switch plans from your dashboard at any time. We'll send you a reminder before your plan ends so your business is never interrupted.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="contact" className="bg-white py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center mb-14">
            <Badge className="mb-5 text-sm px-4 py-1.5 bg-primary/10 text-primary border-0 font-semibold">
              FAQ
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-5">
              Got Questions?
            </h2>
            <p className="text-xl text-slate-500">
              Everything you need to know about EMenu Cambodia.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:border-slate-300 transition-colors">
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
                  <div className="px-7 pb-6 text-base text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
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

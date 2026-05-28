"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";

const faqs = [
  {
    q: "Is EMenu Cambodia really free?",
    a: "Yes! All three plans — 1 Week, 1 Month, and 1 Year — are completely free during our launch period. We believe every Cambodian restaurant deserves access to modern technology without financial barriers.",
  },
  {
    q: "How long does setup take?",
    a: "Most restaurants are fully set up in under an hour. Register, add your menu items, download your QR codes, and you're live. Our onboarding guide walks you through every step.",
  },
  {
    q: "Do my customers need to download an app?",
    a: "No app required. Guests simply point their phone camera at the QR code and the menu opens instantly in their browser. Works on all smartphones — Android or iPhone.",
  },
  {
    q: "Can I use EMenu Cambodia for multiple locations?",
    a: "Yes! The 1 Year plan supports multiple restaurant locations, each with its own menu, QR codes, and analytics — all managed from one central dashboard.",
  },
  {
    q: "Is the menu available in Khmer?",
    a: "Absolutely. EMenu Cambodia fully supports both Khmer and English so you can serve local and international guests equally well.",
  },
  {
    q: "What happens after my plan expires?",
    a: "You can renew or switch plans from your dashboard at any time. We'll send you a reminder before your plan ends so you're never caught off guard.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="contact" className="bg-background py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <FadeIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-sm px-4 py-1.5 mb-6">
              FAQ
            </Badge>
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-5">
              Got Questions?
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about EMenu Cambodia.
            </p>
          </div>
        </FadeIn>

        {/* FAQ list */}
        <FadeIn direction="up" delay={150}>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div
                key={i}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                >
                  <span
                    className={cn(
                      "text-xl font-medium pr-4",
                      open === i ? "text-primary" : "text-foreground"
                    )}
                  >
                    {q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-6 h-6 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                      open === i ? "rotate-180" : ""
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    open === i ? "max-h-60" : "max-h-0"
                  )}
                >
                  <div className="px-6 pb-5 text-base text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
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

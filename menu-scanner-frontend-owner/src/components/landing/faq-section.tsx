"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How does the 14-day free trial work?",
    a: "Sign up and get full access to all Professional features for 14 days — no credit card required. After the trial, choose the plan that fits your needs or continue with our Starter plan.",
  },
  {
    q: "Can I use eMenu across multiple restaurant locations?",
    a: "Yes! Our Professional and Enterprise plans support multiple locations. Each branch gets its own menu, QR codes, and analytics dashboard, all managed from one account.",
  },
  {
    q: "Do my customers need to download an app?",
    a: "No app required. Guests simply scan the QR code with their phone's camera and the menu opens instantly in their browser. Completely frictionless experience.",
  },
  {
    q: "How long does the initial setup take?",
    a: "Most restaurants are fully set up within a few hours. Our onboarding guide walks you through every step, and our support team is available whenever you need help.",
  },
  {
    q: "Can I customize the look of my digital menu?",
    a: "Absolutely. You can add your logo, choose color themes, organize categories, add product photos, and write descriptions. Your digital menu will feel uniquely yours.",
  },
  {
    q: "What payment methods does eMenu support?",
    a: "eMenu supports cash, ABA Pay, Wing, credit/debit cards, and most major digital wallets used in Cambodia. All payment records are logged automatically.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="contact" className="bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about eMenu.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
              >
                <span className={cn(
                  "text-sm font-medium",
                  open === i ? "text-primary" : "text-foreground"
                )}>
                  {q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                    open === i ? "rotate-180" : ""
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  open === i ? "max-h-40" : "max-h-0"
                )}
              >
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                  {a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/landing/fade-in";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "What features are included in ScanMeKH?",
    a: "Every subscription plan unlocks 100% of ScanMeKH features! This includes QR code digital menus, shop POS checkout, real-time order dispatching with Telegram bot alerts, product inventory management, staff HR & attendance logs, sales reports with exportable financial statements, and multi-branch management. You get full access from day one!",
  },
  {
    q: "How fast can my business go live with ScanMeKH?",
    a: "Most restaurant and retail shop owners go live in less than 30 minutes! Simply register your business account, add your menu categories and items, download your custom QR code, and start receiving live customer orders immediately. Our friendly support team is always available to help you set up.",
  },
  {
    q: "Do my customers need to download a mobile app to order?",
    a: "No app download is needed! Customers simply point their smartphone camera at the table QR code, and your digital storefront opens instantly in their mobile web browser. It is smooth, fast, and works seamlessly on all iOS and Android devices.",
  },
  {
    q: "Can I generate sales reports and financial statements?",
    a: "Yes! ScanMeKH provides comprehensive daily, weekly, and monthly sales reports, top-selling product statistics, itemized transaction logs, and exportable financial statements so you can monitor your business revenue with complete transparency.",
  },
  {
    q: "Can I manage staff accounts, roles, and attendance?",
    a: "Absolutely! You can invite unlimited staff members and assign custom roles such as Owner, Admin, Manager, Cashier, or Employee. The platform tracks staff activity, shift attendance, and security audit logs so your team operates smoothly and securely.",
  },
  {
    q: "How does Telegram order notification work?",
    a: "You can easily connect your business Telegram group to ScanMeKH. Whenever a customer or cashier places an order, the Telegram bot pushes an instant order alert to your group chat so kitchen staff and waiters never miss a single ticket!",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-14 sm:py-20 bg-background overflow-hidden">
      {/* Background Aura */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <Badge variant="secondary" className="px-3 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-full">
              <HelpCircle className="w-3.5 h-3.5 mr-1 inline" /> Helpful Answers
            </Badge>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Questions & Detailed Answers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Everything you need to know about setting up your business digital storefront with ScanMeKH.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-[16px] border bg-card overflow-hidden transition-all duration-200 shadow-2xs",
                    isOpen
                      ? "border-primary/60 ring-2 ring-primary/20 shadow-xs"
                      : "border-border/80 hover:border-border"
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-primary shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-xs text-muted-foreground leading-relaxed font-medium border-t border-border/40 pt-3 animate-in fade-in-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

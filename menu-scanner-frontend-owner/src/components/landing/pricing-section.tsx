"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: "Perfect for small restaurants",
    features: [
      "1 Restaurant Location",
      "Up to 50 Menu Items",
      "QR Code Menu",
      "Basic Order Management",
      "5 Staff Accounts",
      "Email Support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Professional",
    monthlyPrice: 79,
    yearlyPrice: 63,
    description: "For growing restaurants & chains",
    features: [
      "Up to 5 Locations",
      "Unlimited Menu Items",
      "Advanced Analytics Dashboard",
      "Real-time Order Notifications",
      "Staff & Role Management",
      "Custom Branding",
      "20 Staff Accounts",
      "Priority Support (24/7)",
    ],
    cta: "Get Started",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    description: "For large chains & enterprises",
    features: [
      "Unlimited Locations",
      "Everything in Professional",
      "Dedicated Account Manager",
      "Custom Integrations & API",
      "SLA Guarantee (99.9%)",
      "On-site Training",
      "Unlimited Staff Accounts",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground mb-6">
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-lg p-1 border border-border">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                !yearly ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                yearly ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
              <Badge variant="default" className="text-xs py-0">Save 20%</Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative border transition-all duration-200",
                plan.popular
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border/60 hover:border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="text-xs px-3">Most Popular</Badge>
                </div>
              )}

              <CardHeader className={cn(
                "pb-4",
                plan.popular ? "bg-primary/5 border-b border-border/50" : "border-b border-border/40"
              )}>
                <div className="font-bold text-lg text-foreground">{plan.name}</div>
                <div className="text-sm text-muted-foreground">{plan.description}</div>
                <div className="mt-3">
                  {plan.monthlyPrice ? (
                    <>
                      <span className="text-3xl font-extrabold text-foreground">
                        ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">/month</span>
                      {yearly && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Billed annually (${(plan.yearlyPrice! * 12).toLocaleString()}/yr)
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-foreground">Custom</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-5">
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.ctaVariant}
                  className="w-full"
                  asChild
                >
                  <Link href={ROUTES.PUBLIC.REGISTER}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
